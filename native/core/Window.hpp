#pragma once

#include "base/threading/ThreadSafeQueue.hpp"
#include "base/UniqueFunction.hpp"

class Window
{
private:
    Window(/* args */);

    ThreadSafeQueue<UniqueFunction> _beforeTickQueue;

    ~Window();

public:
    static Window &instance();

    int loop();

    void run(UniqueFunction &&func)
    {
        _beforeTickQueue.push(std::forward<UniqueFunction>(func));
    }
};
