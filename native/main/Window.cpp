#include "log.h"
#include "env.hpp"
#include "Window.hpp"
#include "Loop.hpp"
#include "base/threading/ThreadPool.hpp"
#include "sugars/sdlsugar.hpp"
#include "sugars/v8sugar.hpp"
#include "InspectorClient.hpp"
#include "internal/console.hpp"
#include "internal/text.hpp"
#include "bg/Device.hpp"
#include <chrono>
#include <nlohmann/json.hpp>

#include <puttyknife/runtime.hpp>
#include <puttyknife/yoga.hpp>
#include <puttyknife/spi.hpp>
#include <puttyknife/phys.hpp>

extern "C"
{
    void ImageBitmap_initialize(v8::Local<v8::Object> exports_obj);
    void Loader_initialize(v8::Local<v8::Object> exports_obj);
    void WebSocket_initialize(v8::Local<v8::Object> exports_obj);
    void gfx_initialize(v8::Local<v8::Object> exports_obj);
    void Loop_initialize(v8::Local<v8::Object> exports_obj);
    void Window_initialize(v8::Local<v8::Object> exports_obj);
}

#define NANOSECONDS_60FPS 16666667LL

Window &Window::instance()
{
    static Window instance;
    return instance;
}

double Window::now()
{
    return std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::steady_clock::now().time_since_epoch()).count() * 0.001;
}

int Window::loop(SDL_Window *sdl_window)
{
    bool debug = false;
#ifndef NDEBUG
    debug = true;
#endif
    ZERO_LOG_INFO("zero engine version: %s", debug ? "debug" : "release");

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

    std::unique_ptr<v8::Platform> platform = v8::platform::NewDefaultPlatform();
    v8::V8::InitializePlatform(platform.get());
    v8::V8::SetFlagsFromString("--expose-gc-as=__gc__");
    v8::V8::Initialize();

    int loop_ec = 0;

    // Isolate Scope
    {
        const std::string script_name = bootstrap_json["script"];
        const std::filesystem::path script_path = std::filesystem::path(project_path).append(script_name);

        sugar::v8::unique_isolate isolate = sugar::v8::isolate_create(std::filesystem::path(script_path).append("importmap.json"));
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
                ZERO_LOG_ERROR(
                    "%s\nSTACK:\n%s\n",
                    *v8::String::Utf8Value{v8::Isolate::GetCurrent(), message->Get()},
                    sugar::v8::stackTrace_toString(message->GetStackTrace()).c_str());
            });

        v8::Isolate::Scope isolate_scope(isolate.get());
        v8::HandleScope handle_scope(isolate.get());
        v8::Local<v8::Context> context = v8::Context::New(isolate.get());
        v8::Context::Scope context_scope(context);

        // create InspectorClient once context created
        InspectorClient inspectorClient(context);

        _loader = std::make_unique<loader::Loader>(project_path, &zero::Loop::instance(), &ThreadPool::shared());
        _device = std::make_unique<gfx::Device>(
            sdl_window,
            []
            {
                zero::Loop::instance().terminate();
            });
        _device->initialize();

        auto ns_global = context->Global();

        auto ns_gfx = v8::Object::New(isolate.get());
        gfx_initialize(ns_gfx);
        ns_global->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "gfx"), ns_gfx).ToChecked();

        auto ns_puttyknife = v8::Object::New(isolate.get());
        auto ns_runtime = v8::Object::New(isolate.get());
        puttyknife::Runtime(context, ns_runtime);
        ns_puttyknife->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "runtime"), ns_runtime).ToChecked();
        auto ns_yoga = v8::Object::New(isolate.get());
        puttyknife::Yoga(context, ns_yoga);
        ns_puttyknife->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "yoga"), ns_yoga).ToChecked();
        auto ns_spi = v8::Object::New(isolate.get());
        puttyknife::Spi(context, ns_spi);
        ns_puttyknife->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "spi"), ns_spi).ToChecked();
        auto ns_phys = v8::Object::New(isolate.get());
        puttyknife::Phys(context, ns_phys);
        ns_puttyknife->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "phys"), ns_phys).ToChecked();
        ns_global->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "puttyknife"), ns_puttyknife).ToChecked();

        auto ns_zero = v8::Object::New(isolate.get());
        ImageBitmap_initialize(ns_zero);
        Loader_initialize(ns_zero);
        WebSocket_initialize(ns_zero);
        Loop_initialize(ns_zero);
        Window_initialize(ns_zero);

        text_initialize(context, ns_zero);
        ns_global->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "zero"), ns_zero).ToChecked();

        console_initialize(context, ns_global);

        ns_global->Set(
                     context,
                     v8::String::NewFromUtf8Literal(isolate.get(), "require"),
                     v8::FunctionTemplate::New(
                         isolate.get(),
                         [](const v8::FunctionCallbackInfo<v8::Value> &info)
                         {
                             auto isolate = info.GetIsolate();
                             auto context = isolate->GetCurrentContext();

                             sugar::v8::run(context, *_v8::String::Utf8Value(isolate, info[0]));
                         })
                         ->GetFunction(context)
                         .ToLocalChecked())
            .ToChecked();

        std::filesystem::path indexSrc = std::filesystem::path(script_path).append("dist/script/index.js");
        {
            std::error_code ec;
            auto res = std::filesystem::canonical(indexSrc, ec);
            if (ec)
            {
                ZERO_LOG_ERROR("index.js not exists: %s", indexSrc.string().c_str());
                return -1;
            }
            indexSrc = std::move(res);
        }

        v8::Local<v8::Promise> index_promise;
        sugar::v8::module_evaluate(context, indexSrc, &index_promise);
        if (index_promise.IsEmpty())
        {
            ZERO_LOG_ERROR("index.js load failed: %s\n", indexSrc.string().c_str());
            return -1;
        }

        loop_ec = zero::Loop::instance().service(sdl_window, platform.get(), isolate.get(), inspectorClient, index_promise);

        ThreadPool::shared().join();

        _device->finish();
    }
    v8::V8::Dispose();
    v8::V8::DisposePlatform();

    return loop_ec;
}