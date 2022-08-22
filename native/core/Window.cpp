#include "Window.hpp"
#include "sugars/sdlsugar.hpp"
#include "sugars/v8sugar.hpp"
#include "bindings/console.hpp"
#include "bindings/gfx/device.hpp"
#include <chrono>
#include <thread>

#define NANOSECONDS_PER_SECOND 1000000000
#define NANOSECONDS_60FPS 16666667L

Window *Window::instance()
{
    static Window instance;
    return &instance;
}

Window::Window() {}

Window::~Window() {}

int Window::loop()
{
    sugar::sdl::unique_window window = sugar::sdl::initWithWindow();
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
        context, v8::String::NewFromUtf8Literal(isolate.get(), "console"),
        binding::console(isolate.get())->GetFunction(context).ToLocalChecked()->NewInstance(context).ToLocalChecked());

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
        v8::Local<v8::Object> default = sugar::v8::object_get<v8::Object>(context, ns, "default");
        if (default.IsEmpty())
        {
            printf("bootstrap.js: no default export found\n");
            return -1;
        }
        bootstrap = handle_scope.Escape(default);
    }
    auto appSrc = sugar::v8::object_get<v8::String>(context, bootstrap, "app");
    if (appSrc.IsEmpty())
    {
        printf("bootstrap.js: no app found\n");
        return -1;
    }
    printf("app: %s\n", *v8::String::Utf8Value(isolate.get(), appSrc));
    v8::Local<v8::Object> app;
    {
        v8::EscapableHandleScope handle_scope(isolate.get());

        auto maybeModule = sugar::v8::module_evaluate(context, appSrc);
        if (maybeModule.IsEmpty())
        {
            printf("app load failed: %s\n", *v8::String::Utf8Value(isolate.get(), appSrc));
            return -1;
        }

        v8::Local<v8::Object> ns = maybeModule.ToLocalChecked()->GetModuleNamespace().As<v8::Object>();
        v8::Local<v8::Object> default = sugar::v8::object_get<v8::Object>(context, ns, "default");
        if (default.IsEmpty())
        {
            printf("app: no default export found\n");
            return -1;
        }

        auto init = sugar::v8::object_get<v8::Function>(context, default, "init");
        if (init.IsEmpty())
        {
            printf("app: no init function found\n");
            return -1;
        }
        v8::Local<v8::Value> args[] = {binding::gfx::device(isolate.get())->GetFunction(context).ToLocalChecked()->NewInstance(context).ToLocalChecked()};
        v8::Local<v8::Value> res = init->Call(context, default, 1, args).ToLocalChecked();
        if (!res->IsBoolean())
        {
            printf("app: invalid init function return value\n");
            return -1;
        }
        if (res->BooleanValue(isolate.get()))
        {
            return -1;
        }

        app = handle_scope.Escape(default);
    }

    auto tick = sugar::v8::object_get<v8::Function>(context, app, "tick");
    if (tick.IsEmpty())
    {
        printf("app: no tick function found\n");
        return -1;
    }

    bool running = true;
    auto time = std::chrono::steady_clock::now();
    while (running)
    {
        SDL_Event event;
        while (SDL_PollEvent(&event))
        {
            switch (event.type)
            {
            case SDL_QUIT:
                running = false;
                break;
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

        v8::HandleScope handle_scope(isolate.get());

        v8::Local<v8::Value> args[] = {v8::Number::New(isolate.get(), dt)};
        tick->Call(context, app, 1, args);

        SDL_GL_SwapWindow(window.get());
    }

    return 0;
}