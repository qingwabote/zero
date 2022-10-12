#include "Window.hpp"
#include "sugars/sdlsugar.hpp"
#include "sugars/v8sugar.hpp"
#include "bindings/Console.hpp"
#include "bindings/Loader.hpp"
#include "bindings/Platform.hpp"
#include "bindings/gfx/Device.hpp"
#include <chrono>
#include <thread>

#define NANOSECONDS_PER_SECOND 1000000000
#define NANOSECONDS_60FPS 16666667L

namespace
{
    int width = 640;
    int height = 960;
}

Window *Window::instance()
{
    static Window instance;
    return &instance;
}

Window::Window() {}

Window::~Window() {}

int Window::loop()
{
    sugar::sdl::unique_window window = sugar::sdl::initWithWindow(width, height);
    if (!window)
    {
        printf("Could not create window: %s\n", SDL_GetError());
        return -1;
    }

    sugar::v8::unique_isolate isolate = sugar::v8::initWithIsolate();
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
            printf(
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
        (new binding::Console())->js_obj());

    v8::Local<v8::Object> bootstrap;
    {
        v8::EscapableHandleScope handle_scope(isolate.get());

        v8::Local<v8::String> path = v8::String::Concat(
            isolate.get(),
            v8::String::NewFromUtf8(isolate.get(), sugar::sdl::getBasePath().get()).ToLocalChecked(),
            v8::String::NewFromUtf8Literal(isolate.get(), "bootstrap.js"));
        auto maybeModule = sugar::v8::module_evaluate(context, path);
        if (maybeModule.IsEmpty())
        {
            printf("bootstrap.js: load failed\n");
            return -1;
        }
        v8::Local<v8::Object> ns = maybeModule.ToLocalChecked()->GetModuleNamespace().As<v8::Object>();
        v8::Local<v8::Object> default = sugar::v8::object_get(ns, "default").As<v8::Object>();
        if (default.IsEmpty())
        {
            printf("bootstrap.js: no default export found\n");
            return -1;
        }
        bootstrap = handle_scope.Escape(default);
    }

    auto projectDir = sugar::v8::object_get(bootstrap, "project").As<v8::String>();
    if (!projectDir->IsString())
    {
        printf("bootstrap.js: no project found\n");
        return -1;
    }

    v8::Local<v8::Object> app;
    {
        v8::EscapableHandleScope handle_scope(isolate.get());

        auto appSrc = sugar::v8::object_get(bootstrap, "app").As<v8::String>();
        if (!appSrc->IsString())
        {
            printf("bootstrap.js: no app found\n");
            return -1;
        }

        appSrc = v8::String::Concat(isolate.get(), projectDir, appSrc);

        auto maybeModule = sugar::v8::module_evaluate(context, appSrc);
        if (maybeModule.IsEmpty())
        {
            printf("app load failed: %s\n", *v8::String::Utf8Value(isolate.get(), appSrc));
            return -1;
        }

        v8::Local<v8::Object> ns = maybeModule.ToLocalChecked()->GetModuleNamespace().As<v8::Object>();
        v8::Local<v8::Function> constructor = sugar::v8::object_get(ns, "default").As<v8::Function>();
        if (constructor.IsEmpty())
        {
            printf("app: no default class found\n");
            return -1;
        }
        auto maybeApp = constructor->NewInstance(context);
        if (maybeApp.IsEmpty())
        {
            return -1;
        }
        app = handle_scope.Escape(maybeApp.ToLocalChecked());
    }
    global->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "zero"), app);

    auto initialize = sugar::v8::object_get(app, "initialize").As<v8::Function>();
    if (initialize.IsEmpty())
    {
        printf("app: no initialize function found\n");
        return -1;
    }
    binding::gfx::Device *device = new binding::gfx::Device(window.get());
    binding::Platform *platform = new binding::Platform();
    binding::Loader *loader = new binding::Loader(*v8::String::Utf8Value(isolate.get(), projectDir));
    v8::Local<v8::Value>
        args[] = {
            device->js_obj(),
            loader->js_obj(),
            platform->js_obj(),
            v8::Number::New(isolate.get(), width),
            v8::Number::New(isolate.get(), height)};
    v8::MaybeLocal<v8::Value> maybeRes = initialize->Call(context, app, 5, args);
    if (maybeRes.IsEmpty())
    {
        return -1;
    }
    auto res = maybeRes.ToLocalChecked();
    if (res->BooleanValue(isolate.get()))
    {
        return -1;
    }

    auto input = sugar::v8::object_get(app, "input").As<v8::Object>();
    auto input_emit = sugar::v8::object_get(input, "emit").As<v8::Function>();

    auto app_tick = sugar::v8::object_get(app, "tick").As<v8::Function>();

    bool running = true;
    auto time = std::chrono::steady_clock::now();
    while (running)
    {
        v8::HandleScope handle_scope(isolate.get());

        SDL_Event event;
        while (SDL_PollEvent(&event))
        {
            switch (event.type)
            {
            case SDL_QUIT:
                running = false;
                break;
            case SDL_MOUSEBUTTONDOWN:
            case SDL_MOUSEMOTION:
            {
                char *name = nullptr;
                double x;
                double y;
                if (event.type == SDL_MOUSEBUTTONDOWN)
                {
                    name = "TOUCH_START";
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
                touch->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "x"), v8::Number::New(isolate.get(), x));
                touch->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "y"), v8::Number::New(isolate.get(), y));
                auto touches = v8::Array::New(isolate.get(), 1);
                touches->Set(context, 0, touch);
                auto touchEvent = v8::Object::New(isolate.get());
                touchEvent->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "touches"), touches);
                v8::Local<v8::Value> args[] = {v8::String::NewFromUtf8(isolate.get(), name).ToLocalChecked(), touchEvent};
                input_emit->Call(context, input, 2, args);
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
            dtNS = static_cast<double>(NANOSECONDS_60FPS);
            now = std::chrono::steady_clock::now();
        }
        time = now;

        float dt = dtNS / NANOSECONDS_PER_SECOND;

        v8::Local<v8::Value> args[] = {v8::Number::New(isolate.get(), dt)};
        _v8::TryCatch try_catch(isolate.get());
        app_tick->Call(context, app, 1, args);
        if (try_catch.HasCaught())
        {
            sugar::v8::tryCatch_print(try_catch);
            return -1;
        }

        SDL_GL_SwapWindow(window.get());
    }

    device->waitIdle();

    return 0;
}