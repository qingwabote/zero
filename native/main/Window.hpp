#pragma once

#include "SDL_video.h"
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"
#include "Loader.hpp"
#include "bindings/gfx/Device.hpp"

class Window : public TaskRunner
{
private:
    Window(/* args */);

    std::unique_ptr<loader::Loader> _loader;

    std::unique_ptr<binding::gfx::Device> _device;

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

    binding::gfx::Device &device() { return *_device.get(); }

    using TaskRunner::post;

    int loop(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window);
};
