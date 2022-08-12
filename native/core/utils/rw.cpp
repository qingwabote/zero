#include "rw.hpp"
#include "SDL.h"

namespace zero
{
    static void charDeleter(char *ptr)
    {
        free(ptr);
    }

    unique_char readUtf8(const char *file)
    {
        SDL_RWops *rw = SDL_RWFromFile(file, "r");
        if (rw == NULL)
        {
            return unique_char{nullptr, charDeleter};
        }

        auto size = SDL_RWsize(rw);
        char *res = (char *)malloc(size + 1);
        if (SDL_RWread(rw, res, size, 1) != 1)
        {
            // https://gitlab.com/wikibooks-opengl/modern-tutorials/blob/master/common-sdl2/shader_utils.cpp
            throw "not yet implemented";
        }
        SDL_RWclose(rw);

        res[size] = '\0';

        return unique_char{res, charDeleter};
    }
}