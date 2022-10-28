#pragma once

#include <memory>
#include "SDL.h"

namespace sugar
{
    namespace sdl
    {
        typedef std::unique_ptr<char, void (*)(void *)> unique_char;

        typedef std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> unique_window;
        unique_window initWithWindow(int width, int height);

        unique_char getBasePath();

        unique_char rw_readUtf8(const char *file);
    }
}