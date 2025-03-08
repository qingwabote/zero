#pragma once

#include "SDL_video.h"
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"
#include "events.hpp"
#include "Loader.hpp"
#include "gfx/Device.hpp"

class Window : public TaskRunner
{
private:
    SDL_Window *_sdl_window{nullptr};

    std::unique_ptr<loader::Loader> _loader;

    std::unique_ptr<gfx::Device> _device;

    std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> _touchStartCb;
    std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> _touchMoveCb;
    std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> _touchEndCb;

    std::unique_ptr<bastard::Lambda<void, std::shared_ptr<WheelEvent>>> _wheelCb;

    std::unique_ptr<bastard::Lambda<void>> _frameCb;

    ThreadSafeQueue<std::unique_ptr<bastard::Lambda<void>>> _beforeTickQueue;

protected:
    void post(std::unique_ptr<bastard::Lambda<void>> &&lambda) override
    {
        _beforeTickQueue.push(std::move(lambda));
    }

public:
    static Window &instance();

    loader::Loader &loader() { return *_loader.get(); }

    gfx::Device &device() { return *_device.get(); }

    double now();

    Window() {};

    // refer to wx api
    void onTouchStart(std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> &&cb) { _touchStartCb = std::move(cb); }
    void onTouchMove(std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> &&cb) { _touchMoveCb = std::move(cb); }
    void onTouchEnd(std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> &&cb) { _touchEndCb = std::move(cb); }

    void onWheel(std::unique_ptr<bastard::Lambda<void, std::shared_ptr<WheelEvent>>> &&cb) { _wheelCb = std::move(cb); }

    void onFrame(std::unique_ptr<bastard::Lambda<void>> &&cb) { _frameCb = std::move(cb); }

    using TaskRunner::post;

    int loop(SDL_Window *sdl_window);

    ~Window() {};
};
