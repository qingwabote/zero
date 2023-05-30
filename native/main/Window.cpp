#include "log.h"
#include "env.hpp"
#include "Window.hpp"
#include "base/threading/ThreadPool.hpp"
#include "sugars/sdlsugar.hpp"
#include "sugars/v8sugar.hpp"
#include "libplatform/libplatform.h"
#include "bindings/Console.hpp"
#include "bindings/Loader.hpp"
#include "bindings/Platform.hpp"
#include "bindings/gfx/Device.hpp"
#include "bindings/gfx/DeviceThread.hpp"
#include <chrono>
#include <nlohmann/json.hpp>

#define NANOSECONDS_PER_SECOND 1000000000
#define NANOSECONDS_60FPS 16666667L

Window &Window::instance()
{
    static Window instance;
    return instance;
}

Window::Window() {}

Window::~Window() {}

int Window::loop(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window)
{
    std::string bootstrap_path = env::bootstrap();
    nlohmann::json bootstrap_json;
    try
    {
        bootstrap_json = nlohmann::json::parse(std::ifstream(bootstrap_path));
    }
    catch (nlohmann::json::parse_error &e)
    {
        ZERO_LOG_ERROR("failed to parse %s %s", bootstrap_path.c_str(), e.what());
        return -1;
    }

    const std::filesystem::path project = bootstrap_json["project"];

    std::unique_ptr<v8::Platform>
        platform = v8::platform::NewDefaultPlatform();
    v8::V8::InitializePlatform(platform.get());
    v8::V8::SetFlagsFromString("--expose-gc-as=__gc__");
    v8::V8::Initialize();

    // Isolate Scope
    {
        sugar::v8::unique_isolate isolate = sugar::v8::initWithIsolate(std::filesystem::path(project).append("imports.json"));
        isolate->SetOOMErrorHandler(
            [](const char *location, const v8::OOMDetails &details)
            {
                throw "Function SetOOMErrorHandler not yet implemented";
            });
        isolate->SetPromiseRejectCallback(sugar::v8::isolate_promiseRejectCallback);
        isolate->SetCaptureStackTraceForUncaughtExceptions(true, 20, v8::StackTrace::kOverview);
        isolate->AddMessageListener(
            [](v8::Local<v8::Message> message, v8::Local<v8::Value> data)
            {
                ZERO_LOG(
                    "%s\nSTACK:\n%s\n",
                    *v8::String::Utf8Value{v8::Isolate::GetCurrent(), message->Get()},
                    sugar::v8::stackTrace_toString(message->GetStackTrace()).c_str());
            });

        v8::Isolate::Scope isolate_scope(isolate.get());
        v8::HandleScope handle_scope(isolate.get());
        v8::Local<v8::Context> context = v8::Context::New(isolate.get());
        v8::Context::Scope context_scope(context);

        auto global = context->Global();
        global->Set(
                  context,
                  v8::String::NewFromUtf8Literal(isolate.get(), "console"),
                  (new binding::Console())->js_obj())
            .ToChecked();

        binding::gfx::Device *gfx = new binding::gfx::Device(sdl_window.get());
        gfx->initialize();
        global->Set(
                  context,
                  v8::String::NewFromUtf8Literal(isolate.get(), "gfx"),
                  gfx->js_obj())
            .ToChecked();

        binding::Loader *loader = new binding::Loader(project);
        global->Set(
                  context,
                  v8::String::NewFromUtf8Literal(isolate.get(), "loader"),
                  loader->js_obj())
            .ToChecked();

        global->Set(
                  context,
                  v8::String::NewFromUtf8Literal(isolate.get(), "platform"),
                  (new binding::Platform())->js_obj())
            .ToChecked();

        std::filesystem::current_path(project);
        std::error_code ec;
        std::filesystem::path appSrc = std::filesystem::canonical(bootstrap_json["app"]);
        if (ec)
        {
            ZERO_LOG_ERROR("%s", ec.message().c_str());
            return -1;
        }

        v8::Local<v8::Object> app;
        v8::Local<v8::Module> app_module;
        v8::Local<v8::Promise> app_promise;
        sugar::v8::module_evaluate(context, appSrc, &app_module, &app_promise);
        if (app_promise.IsEmpty())
        {
            ZERO_LOG_ERROR("app load failed: %s\n", appSrc.string().c_str());
            return -1;
        }

        v8::Local<v8::Function> app_tick;
        v8::Local<v8::Promise> app_initialize_promise;

        v8::Local<v8::Map> name2event = v8::Map::New(isolate.get());
        v8::Local<v8::Value> app_tick_args[] = {name2event};

        bool running = true;
        auto time = std::chrono::steady_clock::now();
        while (running)
        {
            UniqueFunction f{};
            while (_beforeTickQueue.pop(f))
            {
                f();
            }

            while (v8::platform::PumpMessageLoop(platform.get(), isolate.get()))
            {
            }

            if (app.IsEmpty())
            {
                {
                    v8::EscapableHandleScope scope(isolate.get());

                    if (app_promise->State() == v8::Promise::PromiseState::kRejected)
                    {
                        return -1;
                    }
                    if (app_promise->State() == v8::Promise::PromiseState::kPending)
                    {
                        continue;
                    }

                    v8::Local<v8::Object> ns = app_module->GetModuleNamespace().As<v8::Object>();
                    v8::Local<v8::Function> constructor = sugar::v8::object_get(ns, "default").As<v8::Function>();
                    if (constructor.IsEmpty())
                    {
                        ZERO_LOG("app: no default class found\n");
                        return -1;
                    }

                    int width;
                    int height;
                    SDL_GetWindowSize(sdl_window.get(), &width, &height);
                    v8::Local<v8::Value> args[] = {v8::Number::New(isolate.get(), width), v8::Number::New(isolate.get(), height)};
                    auto app_maybe = constructor->NewInstance(context, 2, args);
                    if (app_maybe.IsEmpty())
                    {
                        return -1;
                    }

                    app = scope.Escape(app_maybe.ToLocalChecked());
                }

                {
                    v8::EscapableHandleScope scope(isolate.get());

                    global->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "zero"), app).ToChecked();

                    auto initialize = sugar::v8::object_get(app, "initialize").As<v8::Function>();
                    if (initialize.IsEmpty())
                    {
                        ZERO_LOG("app: no initialize function found\n");
                        return -1;
                    }
                    v8::MaybeLocal<v8::Value> maybe = initialize->Call(context, app, 0, nullptr);
                    if (maybe.IsEmpty())
                    {
                        return -1;
                    }
                    app_initialize_promise = scope.Escape(maybe.ToLocalChecked().As<v8::Promise>());
                }
            }

            if (app_tick.IsEmpty())
            {
                v8::EscapableHandleScope scope(isolate.get());

                if (app_initialize_promise->State() == v8::Promise::PromiseState::kRejected)
                {
                    return -1;
                }
                if (app_initialize_promise->State() == v8::Promise::PromiseState::kPending)
                {
                    continue;
                }
                app_tick = scope.Escape(sugar::v8::object_get(app, "tick").As<v8::Function>());
            }

            SDL_Event event;
            while (SDL_PollEvent(&event))
            {
                v8::HandleScope scope(isolate.get());

                switch (event.type)
                {
                case SDL_QUIT:
                    running = false;
                    break;
                case SDL_MOUSEBUTTONDOWN:
                case SDL_MOUSEBUTTONUP:
                case SDL_MOUSEMOTION:
                {
                    const char *name = nullptr;
                    double x;
                    double y;
                    if (event.type == SDL_MOUSEBUTTONDOWN)
                    {
                        name = "TOUCH_START";
                        x = event.button.x;
                        y = event.button.y;
                    }
                    else if (event.type == SDL_MOUSEBUTTONUP)
                    {
                        name = "TOUCH_END";
                        x = event.button.x;
                        y = event.button.y;
                    }
                    else if (event.type == SDL_MOUSEMOTION)
                    {
                        if ((event.motion.state & SDL_BUTTON_LMASK) == 0)
                        {
                            break;
                        }
                        name = "TOUCH_MOVE";
                        x = event.motion.x;
                        y = event.motion.y;
                    }
                    auto touch = v8::Object::New(isolate.get());
                    touch->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "x"), v8::Number::New(isolate.get(), x)).ToChecked();
                    touch->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "y"), v8::Number::New(isolate.get(), y)).ToChecked();
                    auto touches = v8::Array::New(isolate.get(), 1);
                    touches->Set(context, 0, touch).ToChecked();
                    auto touchEvent = v8::Object::New(isolate.get());
                    touchEvent->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "touches"), touches).ToChecked();
                    name2event->Set(context, v8::String::NewFromUtf8(isolate.get(), name).ToLocalChecked(), touchEvent).ToLocalChecked();
                    break;
                }
                default:
                    break;
                }
            }

            auto now = std::chrono::steady_clock::now();
            auto dtNS = static_cast<double>(std::chrono::duration_cast<std::chrono::nanoseconds>(now - time).count());
            if (dtNS < NANOSECONDS_60FPS)
            {
                std::this_thread::sleep_for(
                    std::chrono::nanoseconds(NANOSECONDS_60FPS - static_cast<int64_t>(dtNS)));
            }
            time = now;

            v8::TryCatch try_catch(isolate.get());
            if (app_tick->Call(context, app, 1, app_tick_args).IsEmpty())
            {
                sugar::v8::tryCatch_print(try_catch);
                return -1;
            }
            name2event->Clear();
        }

        ThreadPool::shared().join();

        binding::gfx::DeviceThread::instance().join();

        gfx->finish();
    }
    v8::V8::Dispose();
    v8::V8::DisposePlatform();

    return 0;
}