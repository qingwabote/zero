#pragma once

#include <functional>

class Window
{
private:
    Window(/* args */);
    ~Window();

public:
    static Window *instance();

    int loop();

    void requestAnimationFrame(const std::function<void(int)> &callback);
};
