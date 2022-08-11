#include "Window.hpp"
#include "Log.hpp"
#include "SDL.h"
#include "v8.h"
#include "libplatform/libplatform.h"
#include <chrono>
#include <thread>

using namespace v8;

#define NANOSECONDS_PER_SECOND 1000000000
#define NANOSECONDS_60FPS 16666667L

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
        Log::log("SDL could not initialize! SDL_Error: %s\n", SDL_GetError());
        return -1;
    }

    SDL_Window *window = SDL_CreateWindow(
        "An SDL2 window",        // window title
        SDL_WINDOWPOS_UNDEFINED, // initial x position
        SDL_WINDOWPOS_UNDEFINED, // initial y position
        640,                     // width, in pixels
        480,                     // height, in pixels
        SDL_WINDOW_VULKAN        // flags
    );

    if (window == NULL)
    {
        Log::log("Could not create window: %s\n", SDL_GetError());
        return -1;
    }

    // Initialize V8.
    std::unique_ptr<v8::Platform> platform = v8::platform::NewDefaultPlatform();
    v8::V8::InitializePlatform(platform.get());
    v8::V8::Initialize();
    {
        // Create a new Isolate and make it the current one.
        std::unique_ptr<v8::ArrayBuffer::Allocator> allocator{v8::ArrayBuffer::Allocator::NewDefaultAllocator()};
        v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator = allocator.get();
        auto isolateDeleter = [](v8::Isolate *ptr)
        { ptr->Dispose(); };
        std::unique_ptr<v8::Isolate, decltype(isolateDeleter)> isolate{v8::Isolate::New(create_params), isolateDeleter};
        {
            v8::Isolate::Scope isolate_scope(isolate.get());
            // Create a stack-allocated handle scope.
            v8::HandleScope handle_scope(isolate.get());
            // Create a new context.
            v8::Local<v8::Context> context = v8::Context::New(isolate.get());
            // Enter the context for compiling and running the hello world script.
            v8::Context::Scope context_scope(context);

            // Create a string containing the JavaScript source code.
            v8::Local<v8::String> source =
                v8::String::NewFromUtf8Literal(isolate.get(), "'Hello' + ', World!'");
            // Compile the source code.
            v8::Local<v8::Script> script =
                v8::Script::Compile(context, source).ToLocalChecked();
            // Run the script to get the result.
            v8::Local<v8::Value> result = script->Run(context).ToLocalChecked();
            // Convert the result to an UTF8 string and print it.
            v8::String::Utf8Value utf8(isolate.get(), result);
            Log::log("%s\n", *utf8);
        }
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

        SDL_GL_SwapWindow(window);
    }

    // tear down V8.
    v8::V8::Dispose();
    v8::V8::DisposePlatform();

    return 0;
}