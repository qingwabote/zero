#pragma once

#include "Loader.hpp"
#include "gfx/Device.hpp"

class Window
{
private:
    std::unique_ptr<loader::Loader> _loader;
    std::unique_ptr<gfx::Device> _device;

    Window() {};

public:
    static Window &instance();

    loader::Loader &loader() { return *_loader.get(); }

    gfx::Device &device() { return *_device.get(); }

    double now();

    int loop(SDL_Window *sdl_window);

    ~Window() {};
};
