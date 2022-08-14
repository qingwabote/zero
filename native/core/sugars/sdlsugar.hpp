#pragma once

#include <memory>
#include "SDL.h"

namespace sugar
{
    typedef std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> unique_window;
    unique_window sdl_initWithWindow();

    typedef std::unique_ptr<char, void (*)(char *)> unique_char;
    unique_char sdl_rw_readUtf8(const char *file);
}