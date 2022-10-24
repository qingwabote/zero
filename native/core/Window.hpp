#pragma once

#include "ThreadSafeQueue.hpp"

class Window
{
private:
    Window(/* args */);

    ThreadSafeQueue<std::function<void()>> _beforeTickQueue;

    ~Window();

public:
    static Window *instance();

    int loop();

    void beforeTick(std::function<void()> &&func)
    {
        _beforeTickQueue.push(std::forward<std::function<void()>>(func));
    }
};
