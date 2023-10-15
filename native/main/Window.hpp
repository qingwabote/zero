#pragma once

#include "SDL_video.h"
#include "base/callable.hpp"
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"
#include "events.hpp"
#include "Loader.hpp"
#include "gfx/Device.hpp"

class Window : public TaskRunner
{
private:
    std::unique_ptr<loader::Loader> _loader;

    std::unique_ptr<gfx::Device> _device;

    std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> _touchStartCb;
    std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> _touchMoveCb;
    std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> _touchEndCb;

    std::unique_ptr<callable::Callable<void>> _frameCb;

    ThreadSafeQueue<UniqueFunction<void>> _beforeTickQueue;

protected:
    void post(UniqueFunction<void> &&func) override
    {
        _beforeTickQueue.push(std::forward<UniqueFunction<void>>(func));
    }

public:
    static Window &instance();

    Window(){};

    loader::Loader &loader() { return *_loader.get(); }

    gfx::Device &device() { return *_device.get(); }

    double now();

    void onTouchStart(std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> &&cb) { _touchStartCb = std::move(cb); }
    void onTouchMove(std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> &&cb) { _touchMoveCb = std::move(cb); }
    void onTouchEnd(std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> &&cb) { _touchEndCb = std::move(cb); }

    void onFrame(std::unique_ptr<callable::Callable<void>> &&cb) { _frameCb = std::move(cb); }

    using TaskRunner::post;

    int loop(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window);

    ~Window(){};
};
