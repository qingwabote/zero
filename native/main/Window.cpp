#include "log.h"
#include "env.hpp"
#include "Window.hpp"
#include "base/threading/ThreadPool.hpp"
#include "sugars/sdlsugar.hpp"
#include "sugars/v8sugar.hpp"
#include "v8/libplatform/libplatform.h"
#include "InspectorClient.hpp"
#include "internal/console.hpp"
#include "bg/Device.hpp"
#include <chrono>
#include <nlohmann/json.hpp>

extern "C"
{
    void ImageBitmap_initialize(v8::Local<v8::Object> exports_obj);
    void Loader_initialize(v8::Local<v8::Object> exports_obj);
    void gfx_initialize(v8::Local<v8::Object> exports_obj);
    void global_initialize(v8::Local<v8::Object> exports_obj);
}

#define NANOSECONDS_60FPS 16666667LL

Window &Window::instance()
{
    static Window instance;
    return instance;
}

Window::Window() {}

Window::~Window() {}

int Window::loop(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window)
{
    const char *err = nullptr;
    std::string bootstrap_path = env::bootstrap(&err);
    if (err)
    {
        ZERO_LOG_ERROR("failed to get bootstrap path %s", err);
        return -1;
    }
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

    const std::filesystem::path root = bootstrap_json["root"];
    const std::string project_name = bootstrap_json["project"];
    const std::filesystem::path project_path = std::filesystem::path(root).append("projects/" + project_name);

    std::unique_ptr<v8::Platform>
        platform = v8::platform::NewDefaultPlatform();
    v8::V8::InitializePlatform(platform.get());
    v8::V8::SetFlagsFromString("--expose-gc-as=__gc__");
    v8::V8::Initialize();

    // Isolate Scope
    {
        sugar::v8::unique_isolate isolate = sugar::v8::isolate_create(std::filesystem::path(project_path).append("script/jsb/imports.json"));
        if (!isolate)
        {
            return -1;
        }
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

        auto inspector = std::make_unique<InspectorClient>();

        auto global = context->Global();

        _device = std::make_unique<bg::Device>(sdl_window.get());
        _device->initialize();

        _loader = std::make_unique<loader::Loader>(project_path, this, &ThreadPool::shared());

        ImageBitmap_initialize(global);

        Loader_initialize(global);

        auto gfx = v8::Object::New(isolate.get());
        global->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "_gfx_impl"), gfx)
            .ToChecked();
        gfx_initialize(gfx);

        global_initialize(global);

        console_initialize(context, global);

        v8::Local<v8::Promise> engine_promise;
        sugar::v8::module_evaluate(context, "engine-jsb", &engine_promise);
        if (engine_promise.IsEmpty())
        {
            ZERO_LOG_ERROR("module engine-jsb load failed\n");
            return -1;
        }

        std::filesystem::path appSrc = std::filesystem::path(project_path).append("script/jsb/dist/main/App.js");
        if (!std::filesystem::exists(appSrc))
        {
            ZERO_LOG_ERROR("App.js not exists: %s", appSrc.string().c_str());
            return -1;
        }

        v8::Local<v8::Object> app;
        v8::Local<v8::Module> app_module;
        v8::Local<v8::Promise> app_promise;
        sugar::v8::module_evaluate(context, appSrc, &app_promise, &app_module);
        if (app_promise.IsEmpty())
        {
            ZERO_LOG_ERROR("app load failed: %s\n", appSrc.string().c_str());
            return -1;
        }

        v8::Local<v8::Function> app_tick;
        v8::Local<v8::Map> name2event = v8::Map::New(isolate.get());

        bool running = true;
        while (running)
        {
            inspector->tick();

            UniqueFunction<void> f{};
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

                    auto app_maybe = constructor->NewInstance(context, 0, nullptr);
                    if (app_maybe.IsEmpty())
                    {
                        return -1;
                    }

                    app = scope.Escape(app_maybe.ToLocalChecked());
                }

                {
                    v8::EscapableHandleScope scope(isolate.get());
                    app_tick = scope.Escape(sugar::v8::object_get(app, "tick").As<v8::Function>());
                }
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

            static std::chrono::steady_clock::time_point time;
            static std::chrono::steady_clock::time_point now;

            now = std::chrono::steady_clock::now();
            auto dt = std::chrono::duration_cast<std::chrono::nanoseconds>(now - time).count();
            if (dt < NANOSECONDS_60FPS)
            {
                std::this_thread::sleep_for(std::chrono::nanoseconds(NANOSECONDS_60FPS - dt));
                now = std::chrono::steady_clock::now();
            }
            time = now;

            v8::TryCatch try_catch(isolate.get());
            v8::Local<v8::Value> app_tick_args[] = {name2event, v8::Number::New(isolate.get(), std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count())};
            if (app_tick->Call(context, app, 2, app_tick_args).IsEmpty())
            {
                sugar::v8::tryCatch_print(try_catch);
                return -1;
            }
            name2event->Clear();
        }

        ThreadPool::shared().join();

        _device->finish();
    }
    v8::V8::Dispose();
    v8::V8::DisposePlatform();

    return 0;
}