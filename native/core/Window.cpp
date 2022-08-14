#include "Window.hpp"
#include "SDL.h"
#include "v8.h"
#include "utils/log.hpp"
#include "sugars/sdlsugar.hpp"
#include "sugars/v8sugar.hpp"
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
    sugar::unique_window window = sugar::sdl_initWithWindow();
    if (!window)
    {
        zero::log("Could not create window: %s\n", SDL_GetError());
        return -1;
    }

    sugar::unique_isolate isolate = sugar::v8_initWithIsolate();
    isolate->SetCaptureStackTraceForUncaughtExceptions(true, 20, v8::StackTrace::kOverview);
    isolate->SetOOMErrorHandler(
        [](const char *location, const v8::OOMDetails &details)
        {
            throw "Function SetOOMErrorHandler not yet implemented";
        });
    isolate->SetPromiseRejectCallback(
        [](v8::PromiseRejectMessage message)
        {
            throw "Function SetPromiseRejectCallback not yet implemented";
        });
    isolate->AddMessageListener(
        [](v8::Local<v8::Message> message, v8::Local<v8::Value> data)
        {
            v8::ScriptOrigin origin = message->GetScriptOrigin();
            v8::String::Utf8Value msg{v8::Isolate::GetCurrent(), message->Get()};
            v8::String::Utf8Value srcName{v8::Isolate::GetCurrent(), origin.ResourceName()};
            zero::log("ERROR: %s , location: %s:%d:%d\nSTACK:\n%s", *msg, *srcName, origin.LineOffset(), origin.ColumnOffset(), sugar::v8_stackTrace_toString(message->GetStackTrace()).c_str());
        });
    // {
    v8::Isolate::Scope isolate_scope(isolate.get());
    // Create a stack-allocated handle scope.
    v8::HandleScope handle_scope(isolate.get());
    // Create a new context.
    v8::Local<v8::Context> context = v8::Context::New(isolate.get());
    // Enter the context for compiling and running the hello world script.
    v8::Context::Scope context_scope(context);

    auto maybeModule = sugar::v8_module_load(context, v8::String::NewFromUtf8Literal(isolate.get(), "bootstrap.js"));
    if (maybeModule.IsEmpty())
    {
        zero::log("bootstrap.js: load failed");
        return -1;
    }

    auto module = maybeModule.ToLocalChecked();
    auto maybeOk = module->InstantiateModule(context, sugar::v8_module_load);
    if (maybeOk.IsNothing())
    {
        zero::log("bootstrap.js: resolve failed");
        return -1;
    }

    module->Evaluate(context);
    v8::Local<v8::Object> ns = module->GetModuleNamespace().As<v8::Object>();
    v8::Local<v8::Object> default = sugar::v8_object_get<v8::Object>(context, ns, "default");
    if (default.IsEmpty())
    {
        zero::log("bootstrap.js: no default export found");
        return -1;
    }
    v8::Local<v8::String> root = sugar::v8_object_get<v8::String>(context, default, "root");
    if (root.IsEmpty())
    {
        zero::log("bootstrap.js: no root found");
        return -1;
    }

    zero::log("dd");

    // }

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

        SDL_GL_SwapWindow(window.get());
    }

    return 0;
}