#include "sdlsugar.hpp"
#include "log.h"

namespace sugar
{
    namespace sdl
    {

        static void windowDeleter(SDL_Window *ptr)
        {
            SDL_DestroyWindow(ptr);
            SDL_Quit();
        }
        unique_window initWithWindow(int width, int height)
        {
            if (SDL_Init(SDL_INIT_VIDEO) < 0)
            {
                ZERO_LOG("SDL could not initialize! SDL_Error: %s\n", SDL_GetError());
                return unique_window{nullptr, windowDeleter};
            }

            return unique_window{
                SDL_CreateWindow("zero",                  // window title
                                 SDL_WINDOWPOS_UNDEFINED, // initial x position
                                 SDL_WINDOWPOS_UNDEFINED, // initial y position
                                 width,                   // width, in pixels
                                 height,                  // height, in pixels
                                 SDL_WINDOW_VULKAN        // flags
                                 ),
                windowDeleter};
        }

        unique_char getBasePath()
        {
            return unique_char{SDL_GetBasePath(), SDL_free};
        }
    }
}