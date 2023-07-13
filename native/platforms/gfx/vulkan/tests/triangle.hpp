#pragma once

#include "SDL_vulkan.h"
#include <memory>

namespace tests::triangle
{
    bool draw(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window);
}