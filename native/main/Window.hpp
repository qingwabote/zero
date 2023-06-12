#pragma once

#include "SDL_video.h"
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"

class Window : public TaskRunner
{
private:
    Window(/* args */);

    ThreadSafeQueue<UniqueFunction<void>> _beforeTickQueue;

    ~Window();

protected:
    void post(UniqueFunction<void> &&func) override
    {
        _beforeTickQueue.push(std::forward<UniqueFunction<void>>(func));
    }

public:
    static Window &instance();

    using TaskRunner::post;

    int loop(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window);
};
