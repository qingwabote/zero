#include "log.h"
#include "env.hpp"
#include "Window.hpp"
#include "base/threading/ThreadPool.hpp"
#include "sugars/sdlsugar.hpp"
#include "sugars/v8sugar.hpp"
#include "v8/libplatform/libplatform.h"
#include "InspectorClient.hpp"
#include "internal/console.hpp"
#include "internal/text.hpp"
#include "bg/Device.hpp"
#include <chrono>
#include <nlohmann/json.hpp>

extern "C"
{
    void ImageBitmap_initialize(v8::Local<v8::Object> exports_obj);
    void Loader_initialize(v8::Local<v8::Object> exports_obj);
    void gfx_initialize(v8::Local<v8::Object> exports_obj);
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

    std::unique_ptr<v8::Platform>
        platform = v8::platform::NewDefaultPlatform();
    v8::V8::InitializePlatform(platform.get());
    v8::V8::SetFlagsFromString("--expose-gc-as=__gc__");
    v8::V8::Initialize();

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

        auto inspector = std::make_unique<InspectorClient>();

        _loader = std::make_unique<loader::Loader>(project_path, this, &ThreadPool::shared());
        _device = std::make_unique<gfx::Device>(sdl_window);
        _device->initialize();
        _sdl_window = sdl_window;

        auto ns_global = context->Global();

        auto ns_gfx = v8::Object::New(isolate.get());
        gfx_initialize(ns_gfx);
        ns_global->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "gfx"), ns_gfx).ToChecked();

        auto ns_zero = v8::Object::New(isolate.get());
        ImageBitmap_initialize(ns_zero);
        Loader_initialize(ns_zero);
        Window_initialize(ns_zero);
        text_initialize(context, ns_zero);
        console_initialize(context, ns_global);
        ns_global->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "zero"), ns_zero).ToChecked();

        ns_global->Set(context, v8::String::NewFromUtf8Literal(isolate.get(), "require"),
                       v8::FunctionTemplate::New(isolate.get(),
                                                 [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                                 {
                                                     auto isolate = info.GetIsolate();
                                                     auto context = isolate->GetCurrentContext();

                                                     sugar::v8::run(context, *_v8::String::Utf8Value(isolate, info[0]));
                                                 })
                           ->GetFunction(context)
                           .ToLocalChecked());

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

        int width = 0;
        int height = 0;
        float pixelRatio = 1;
        {
            SDL_GetWindowSize(_sdl_window, &width, &height);

            int widthInPixels = 0;
            SDL_GetWindowSizeInPixels(_sdl_window, &widthInPixels, nullptr);

            pixelRatio = static_cast<float>(widthInPixels) / width;
        }

        {
            std::unordered_map<SDL_FingerID, std::shared_ptr<Touch>> touches;

            bool running = true;
            while (running)
            {
                inspector->tick();

                std::unique_ptr<callable::Callable<void>> f{};
                while (_beforeTickQueue.pop(f))
                {
                    f->call();
                }

                while (v8::platform::PumpMessageLoop(platform.get(), isolate.get()))
                {
                }

                if (!index_promise.IsEmpty())
                {
                    if (index_promise->State() == v8::Promise::PromiseState::kRejected)
                    {
                        return -1;
                    }
                    if (index_promise->State() == v8::Promise::PromiseState::kPending)
                    {
                        continue;
                    }
                    index_promise.Clear();
                }

                SDL_Event event;
                while (SDL_PollEvent(&event))
                {
                    switch (event.type)
                    {
                    case SDL_FINGERDOWN:
                    case SDL_FINGERUP:
                    case SDL_FINGERMOTION:
                    {
                        callable::Callable<void, std::shared_ptr<TouchEvent>> *touchCb = nullptr;
                        if (event.type == SDL_FINGERDOWN)
                        {
                            touches.emplace(event.tfinger.fingerId, new Touch{int32_t(event.tfinger.x * width * pixelRatio), int32_t(event.tfinger.y * height * pixelRatio)});
                            touchCb = _touchStartCb.get();
                        }
                        else if (event.type == SDL_FINGERUP)
                        {
                            touches.erase(event.tfinger.fingerId);
                            touchCb = _touchEndCb.get();
                        }
                        else if (event.type == SDL_FINGERMOTION)
                        {
                            auto &touch = touches.find(event.tfinger.fingerId)->second;
                            touch->x = event.tfinger.x * width * pixelRatio;
                            touch->y = event.tfinger.y * height * pixelRatio;
                            touchCb = _touchMoveCb.get();
                        }

                        auto e = std::make_shared<TouchEvent>();
                        e->touches = std::make_shared<TouchVector>();
                        for (auto &&i : touches)
                        {
                            e->touches->emplace_back(i.second);
                        }
                        touchCb->call(std::move(e));
                        break;
                    }
                    case SDL_MOUSEWHEEL:
                    {
                        if (_wheelCb)
                        {
                            auto touches = std::make_shared<TouchVector>();
                            touches->emplace_back(new Touch{int32_t(event.wheel.mouseX * pixelRatio), int32_t(event.wheel.mouseY * pixelRatio)});
                            _wheelCb->call(std::shared_ptr<WheelEvent>(new WheelEvent{touches, event.wheel.y * 100}));
                        }
                        break;
                    }
                    case SDL_QUIT:
                    {
                        running = false;
                        break;
                    }
                    default:
                        break;
                    }
                }

                if (_frameCb)
                {
                    _frameCb->call();
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
            }
        }

        _touchStartCb = nullptr;
        _touchMoveCb = nullptr;
        _touchEndCb = nullptr;

        _wheelCb = nullptr;

        _frameCb = nullptr;

        ThreadPool::shared().join();

        _device->finish();
    }
    v8::V8::Dispose();
    v8::V8::DisposePlatform();

    return 0;
}