#include "sdlsugar.hpp"

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
                printf("SDL could not initialize! SDL_Error: %s\n", SDL_GetError());
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

        unique_char rw_readUtf8(const char *file)
        {
            SDL_RWops *rw = SDL_RWFromFile(file, "r");
            if (rw == NULL)
            {
                return unique_char{nullptr, free};
            }

            auto size = SDL_RWsize(rw);
            char *res = (char *)malloc(size + 1);
            if (res == NULL)
            {
                return unique_char{nullptr, free};
            }
            if (size && SDL_RWread(rw, res, size, 1) != 1)
            {
                // https://gitlab.com/wikibooks-opengl/modern-tutorials/blob/master/common-sdl2/shader_utils.cpp
                throw "not yet implemented";
            }
            SDL_RWclose(rw);

            res[size] = '\0';

            return unique_char{res, free};
        }
    }
}