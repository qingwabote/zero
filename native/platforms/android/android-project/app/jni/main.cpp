#include "log.h"
#include "SDL.h"
#include "env.hpp"
#include "Window.hpp"
// #include "gfx/vulkan/tests/triangle.hpp"

namespace
{
    static void windowDeleter(SDL_Window *ptr)
    {
        SDL_DestroyWindow(ptr);
        SDL_Quit();
    }
}

namespace env
{
    std::string bootstrap(const char **err)
    {
        auto res = SDL_AndroidGetExternalStoragePath();
        if (!res)
        {
            *err = SDL_GetError();
            return "";
        }
        std::string file(res);
        SDL_free((void *)res);
        *err = nullptr;
        return file + "/bootstrap.json";
    }
}

int main(int argc, char **argv)
{
    if (SDL_Init(SDL_INIT_VIDEO) < 0)
    {
        ZERO_LOG_ERROR("SDL could not initialize! SDL_Error: %s", SDL_GetError());
        return 0;
    }

    SDL_Window *sdl_window = SDL_CreateWindow("zero",
                                              SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED,
                                              0, 0, // If the window is set fullscreen, the width and height parameters `w` and `h` will not be used
                                              SDL_WINDOW_VULKAN | SDL_WINDOW_ALLOW_HIGHDPI | SDL_WINDOW_FULLSCREEN);
    Window::instance().loop(sdl_window);
    // tests::triangle::draw(std::move(sdl_window));

    SDL_DestroyWindow(sdl_window);
    SDL_Quit();

    return 0;
}