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
        printf("Could not create window: %s\n", SDL_GetError());
        return -1;
    }

    sugar::unique_isolate isolate = sugar::v8_initWithIsolate();
    isolate->SetOOMErrorHandler(
        [](const char *location, const v8::OOMDetails &details)
        {
            throw "Function SetOOMErrorHandler not yet implemented";
        });
    isolate->SetPromiseRejectCallback(sugar::v8_isolate_promiseRejectCallback);
    isolate->SetCaptureStackTraceForUncaughtExceptions(true, 20, v8::StackTrace::kOverview);
    isolate->AddMessageListener(
        [](v8::Local<v8::Message> message, v8::Local<v8::Value> data)
        {
            // We use only es moudle and module error has been handled by PromiseRejectCallback, due to the top level await?
            throw "Function AddMessageListener has no implementation";
        });

    v8::Isolate::Scope isolate_scope(isolate.get());
    v8::HandleScope handle_scope(isolate.get());
    v8::Local<v8::Context> context = v8::Context::New(isolate.get());
    v8::Context::Scope context_scope(context);

    v8::Local<v8::Object> bootstrap;
    {
        v8::EscapableHandleScope handle_scope(isolate.get());

        v8::Local<v8::String> path = v8::String::Concat(
            isolate.get(),
            v8::String::NewFromUtf8(isolate.get(), sugar::sdl_getBasePath().get()).ToLocalChecked(),
            v8::String::NewFromUtf8Literal(isolate.get(), "bootstrap.js"));
        auto maybeModule = sugar::v8_module_load(context, path);
        if (maybeModule.IsEmpty())
        {
            printf("bootstrap.js: load failed\n");
            return -1;
        }
        auto module = maybeModule.ToLocalChecked();
        auto maybeOk = module->InstantiateModule(
            context, [](v8::Local<v8::Context> context, v8::Local<v8::String> specifier, v8::Local<v8::FixedArray> import_assertions, v8::Local<v8::Module> referrer) -> v8::MaybeLocal<v8::Module>
            { return {}; });
        if (maybeOk.IsNothing())
        {
            printf("bootstrap.js: does not support import\n");
            return -1;
        }
        // v8::TryCatch inner_try_catch(isolate.get());
        v8::Local<v8::Promise> promise = module->Evaluate(context).ToLocalChecked().As<v8::Promise>();
        if (promise->State() != v8::Promise::kFulfilled)
        {
            printf("bootstrap.js: load failed\n");
            return -1;
        }

        v8::Local<v8::Object> ns = module->GetModuleNamespace().As<v8::Object>();
        v8::Local<v8::Object> default = sugar::v8_object_get<v8::Object>(context, ns, "default");
        if (default.IsEmpty())
        {
            printf("bootstrap.js: no default export found\n");
            return -1;
        }
        bootstrap = handle_scope.Escape(default);

        // v8::Persistent<v8::String> *ref =
        //     new v8::Persistent<v8::String>(isolate.get(), root);
        // ref->SetWeak<v8::Persistent<v8::String>>(
        //     ref,
        //     [](const v8::WeakCallbackInfo<v8::Persistent<v8::String>> &data)
        //     {
        //         data.GetParameter()->Reset();
        //         delete data.GetParameter();
        //     },
        //     v8::WeakCallbackType::kParameter);
    }

    auto root = sugar::v8_object_get<v8::String>(context, bootstrap, "root");
    if (root.IsEmpty())
    {
        printf("bootstrap.js: no root found\n");
        return -1;
    }
    printf("root: %s\n", *v8::String::Utf8Value(isolate.get(), root));
    auto app = sugar::v8_object_get<v8::String>(context, bootstrap, "app");
    if (app.IsEmpty())
    {
        printf("bootstrap.js: no app found\n");
        return -1;
    }
    printf("app: %s\n", *v8::String::Utf8Value(isolate.get(), app));

    auto path = v8::String::Concat(isolate.get(), root, app);
    auto maybeModule = sugar::v8_module_load(context, path);
    if (maybeModule.IsEmpty())
    {
        printf("script load failed: %s\n", *v8::String::Utf8Value(isolate.get(), path));
        return -1;
    }
    auto module = maybeModule.ToLocalChecked();
    context->SetAlignedPointerInEmbedderData(1, &root);
    auto maybeOk = module->InstantiateModule(
        context,
        [](
            v8::Local<v8::Context> context,
            v8::Local<v8::String> specifier,
            v8::Local<v8::FixedArray> import_assertions,
            v8::Local<v8::Module> referrer) -> v8::MaybeLocal<v8::Module>
        {
            auto root = static_cast<v8::Local<v8::String> *>(context->GetAlignedPointerFromEmbedderData(1));
            return sugar::v8_module_load(context, v8::String::Concat(context->GetIsolate(), *root, specifier), import_assertions, referrer);
        });
    if (maybeOk.IsNothing())
    {
        printf("script load failed: %s\n", *v8::String::Utf8Value(isolate.get(), path));
        return -1;
    }
    v8::Local<v8::Promise> promise = module->Evaluate(context).ToLocalChecked().As<v8::Promise>();
    if (promise->State() != v8::Promise::kFulfilled)
    {
        printf("script load failed: %s\n", *v8::String::Utf8Value(isolate.get(), path));
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

        SDL_GL_SwapWindow(window.get());
    }

    return 0;
}