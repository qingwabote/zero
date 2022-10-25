#pragma once

#include "ThreadSafeQueue.hpp"
#include "UniqueFunction.hpp"

class Window
{
private:
    Window(/* args */);

    ThreadSafeQueue<UniqueFunction> _beforeTickQueue;

    ~Window();

public:
    static Window *instance();

    int loop();

    void beforeTick(UniqueFunction &&func)
    {
        _beforeTickQueue.push(std::forward<UniqueFunction>(func));
    }
};
