#include "Loop.hpp"
#include "WebSocket.hpp"
#include <unordered_map>

#define NANOSECONDS_60FPS 16666667LL

namespace zero
{
    int Loop::service(SDL_Window *window, v8::Platform *platform, v8::Isolate *isolate, v8::Local<v8::Promise> promise, InspectorClient *inspectorClient)
    {
        int width = 0;
        int height = 0;
        float pixelRatio = 1;
        {
            SDL_GetWindowSize(window, &width, &height);

            int widthInPixels = 0;
            SDL_GetWindowSizeInPixels(window, &widthInPixels, nullptr);

            pixelRatio = static_cast<float>(widthInPixels) / width;
        }

        std::unordered_map<SDL_FingerID, std::shared_ptr<Touch>> touches;
        while (_running > 0)
        {
            if (inspectorClient)
            {
                inspectorClient->tick();
            }

            std::unique_ptr<bastard::Lambda<void>> f{};
            while (_taskQueue.pop(f))
            {
                f->call();
            }

            while (v8::platform::PumpMessageLoop(platform, isolate))
            {
                // do nothing
            }

            if (!promise.IsEmpty())
            {
                if (promise->State() == v8::Promise::PromiseState::kRejected)
                {
                    return -1;
                }
                if (promise->State() == v8::Promise::PromiseState::kPending)
                {
                    continue;
                }
                promise.Clear();
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
                    bastard::Lambda<void, std::shared_ptr<TouchEvent>> *touchCb = nullptr;
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
                    _running = 0;
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

        _touchStartCb = nullptr;
        _touchMoveCb = nullptr;
        _touchEndCb = nullptr;
        _wheelCb = nullptr;
        _frameCb = nullptr;
        return _running;
    }
}