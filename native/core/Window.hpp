#pragma once

class Window
{
private:
    Window(/* args */);
    ~Window();

public:
    static Window *instance();

    int loop();
};
