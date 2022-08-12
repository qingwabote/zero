#include "Window.hpp"
#include "SDL.h"
#include "v8.h"
#include "libplatform/libplatform.h"
#include "utils/log.hpp"
#include "utils/rw.hpp"
#include "utils/v8sugar.hpp"
#include <chrono>
#include <thread>

#define NANOSECONDS_PER_SECOND 1000000000
#define NANOSECONDS_60FPS 16666667L

static std::string stackTraceToString(v8::Local<v8::StackTrace> stack)
{
    std::string stackStr;
    if (stack.IsEmpty())
    {
        return stackStr;
    }

    char tmp[100] = {0};
    for (int i = 0, e = stack->GetFrameCount(); i < e; ++i)
    {
        v8::Local<v8::StackFrame> frame = stack->GetFrame(v8::Isolate::GetCurrent(), i);
        v8::Local<v8::String> script = frame->GetScriptName();
        std::string scriptName;
        if (!script.IsEmpty())
        {
            scriptName = *v8::String::Utf8Value(v8::Isolate::GetCurrent(), script);
        }

        v8::Local<v8::String> func = frame->GetFunctionName();
        std::string funcName;
        if (!func.IsEmpty())
        {
            funcName = *v8::String::Utf8Value(v8::Isolate::GetCurrent(), func);
        }

        stackStr += " - [";
        snprintf(tmp, sizeof(tmp), "%d", i);
        stackStr += tmp;
        stackStr += "]";
        stackStr += (funcName.empty() ? "anonymous" : funcName.c_str());
        stackStr += "@";
        stackStr += (scriptName.empty() ? "(no filename)" : scriptName.c_str());
        stackStr += ":";
        snprintf(tmp, sizeof(tmp), "%d", frame->GetLineNumber());
        stackStr += tmp;

        if (i < (e - 1))
        {
            stackStr += "\n";
        }
    }

    return stackStr;
}

static v8::MaybeLocal<v8::Module> loadModule(
    v8::Local<v8::Context> context,
    v8::Local<v8::String> specifier,
    v8::Local<v8::FixedArray> import_assertions = v8::Local<v8::FixedArray>(),
    v8::Local<v8::Module> referrer = v8::Local<v8::Module>())
{
    v8::Isolate::Scope isolate_scope(context->GetIsolate());
    v8::EscapableHandleScope handle_scope(context->GetIsolate());
    v8::Context::Scope context_scope(context);

    const char *base = SDL_GetBasePath();
    v8::Local<v8::String> full = v8::String::Concat(context->GetIsolate(), v8::String::NewFromUtf8(context->GetIsolate(), base).ToLocalChecked(), specifier);
    v8::String::Utf8Value utf8{context->GetIsolate(), full};

    auto res = zero::readUtf8(*utf8);
    if (!res)
    {
        context->GetIsolate()->ThrowException(v8::String::NewFromUtf8Literal(context->GetIsolate(), "module resolution error"));
        return v8::MaybeLocal<v8::Module>();
    }

    auto str = v8::String::NewFromUtf8(context->GetIsolate(), res.get()).ToLocalChecked();

    auto origin = v8::ScriptOrigin(context->GetIsolate(), specifier, 0, 0, false, -1, v8::Local<v8::Value>(), false, false, true);
    v8::ScriptCompiler::Source source(str, origin);
    auto maybeModule = v8::ScriptCompiler::CompileModule(context->GetIsolate(), &source);

    return handle_scope.EscapeMaybe(maybeModule);
}

Window *Window::instance()
{
    static Window instance;
    return &instance;
}

Window::Window()
{
}

Window::~Window()
{
}

int Window::loop()
{
    if (SDL_Init(SDL_INIT_VIDEO) < 0)
    {
        zero::log("SDL could not initialize! SDL_Error: %s\n", SDL_GetError());
        return -1;
    }

    auto windowDeleter = [](SDL_Window *ptr)
    {
        SDL_DestroyWindow(ptr);
        SDL_Quit();
    };
    std::unique_ptr<SDL_Window, decltype(windowDeleter)> window{
        SDL_CreateWindow("An SDL2 window",        // window title
                         SDL_WINDOWPOS_UNDEFINED, // initial x position
                         SDL_WINDOWPOS_UNDEFINED, // initial y position
                         640,                     // width, in pixels
                         480,                     // height, in pixels
                         SDL_WINDOW_VULKAN        // flags
                         ),
        windowDeleter};

    if (window.get() == NULL)
    {
        zero::log("Could not create window: %s\n", SDL_GetError());
        return -1;
    }

    // Initialize V8.
    std::unique_ptr<v8::Platform> platform = v8::platform::NewDefaultPlatform();
    v8::V8::InitializePlatform(platform.get());
    v8::V8::Initialize();

    // Create a new Isolate and make it the current one.
    std::unique_ptr<v8::ArrayBuffer::Allocator> allocator{v8::ArrayBuffer::Allocator::NewDefaultAllocator()};
    v8::Isolate::CreateParams create_params;
    create_params.array_buffer_allocator = allocator.get();
    auto isolateDeleter = [](v8::Isolate *ptr)
    {
        ptr->Dispose();
        v8::V8::Dispose();
        v8::V8::DisposePlatform();
    };
    std::unique_ptr<v8::Isolate, decltype(isolateDeleter)> isolate{v8::Isolate::New(create_params), isolateDeleter};
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
            zero::log("ERROR: %s , location: %s:%d:%d\nSTACK:\n%s", *msg, *srcName, origin.LineOffset(), origin.ColumnOffset(), stackTraceToString(message->GetStackTrace()).c_str());
        });
    // {
    v8::Isolate::Scope isolate_scope(isolate.get());
    // Create a stack-allocated handle scope.
    v8::HandleScope handle_scope(isolate.get());
    // Create a new context.
    v8::Local<v8::Context> context = v8::Context::New(isolate.get());
    // Enter the context for compiling and running the hello world script.
    v8::Context::Scope context_scope(context);

    auto maybeModule = loadModule(context, v8::String::NewFromUtf8Literal(isolate.get(), "bootstrap.js"));
    if (maybeModule.IsEmpty())
    {
        zero::log("bootstrap.js: load failed");
        return -1;
    }

    auto module = maybeModule.ToLocalChecked();
    auto maybeOk = module->InstantiateModule(context, loadModule);
    if (maybeOk.IsNothing())
    {
        zero::log("bootstrap.js: resolve failed");
        return -1;
    }

    module->Evaluate(context);
    v8::Local<v8::Object> ns = module->GetModuleNamespace().As<v8::Object>();
    v8::Local<v8::Object> default = zero::v8_object_get<v8::Object>(context, ns, "default");
    if (default.IsEmpty())
    {
        zero::log("bootstrap.js: no default export found");
        return -1;
    }
    v8::Local<v8::String> root = zero::v8_object_get<v8::String>(context, default, "root");
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