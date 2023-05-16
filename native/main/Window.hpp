#pragma once

#include "base/threading/ThreadSafeQueue.hpp"
#include "base/UniqueFunction.hpp"
#include "SDL_video.h"

class Window
{
private:
    Window(/* args */);

    ThreadSafeQueue<UniqueFunction> _beforeTickQueue;

    ~Window();

public:
    static Window &instance();

    int loop(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window);

    void run(UniqueFunction &&func)
    {
        _beforeTickQueue.push(std::forward<UniqueFunction>(func));
    }
};
