#pragma once

#include "SDL_video.h"
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"
#include "Loader.hpp"

class Window : public TaskRunner
{
private:
    Window(/* args */);

    std::unique_ptr<loader::Loader> _loader;

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

    using TaskRunner::post;

    int loop(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window);
};
