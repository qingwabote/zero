#pragma once

#include "SDL_video.h"
#include "base/callable.hpp"
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"
#include "Loader.hpp"
#include "gfx/Device.hpp"

class Window : public TaskRunner
{
private:
    Window(/* args */);

    std::unique_ptr<loader::Loader> _loader;

    std::unique_ptr<gfx::Device> _device;

    std::unique_ptr<callable::Callable<void, double>> _frameCb;

    ThreadSafeQueue<UniqueFunction<void>> _beforeTickQueue;

    ~Window();

protected:
    void post(UniqueFunction<void> &&func) override
    {
        _beforeTickQueue.push(std::forward<UniqueFunction<void>>(func));
    }

public:
    static Window &instance();

    loader::Loader &loader() { return *_loader.get(); }

    gfx::Device &device() { return *_device.get(); }

    void requestAnimationFrame(std::unique_ptr<callable::Callable<void, double>> &&cb) { _frameCb = std::move(cb); }

    using TaskRunner::post;

    int loop(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window);
};
