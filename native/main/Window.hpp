#pragma once

#include "SDL_video.h"
#include "base/UniqueFunction.hpp"
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"

class Window : public TaskRunner
{
private:
    Window(/* args */);

    ThreadSafeQueue<UniqueFunction> _beforeTickQueue;

    ~Window();

public:
    static Window &instance();

    int loop(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window);

    void post(UniqueFunction &&func) override
    {
        _beforeTickQueue.push(std::forward<UniqueFunction>(func));
    }
};
