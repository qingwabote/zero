#include "log.h"
#include "SDL.h"
#include "env.hpp"
#include "Window.hpp"

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
    std::filesystem::path bootstrapJs()
    {
        auto prefPath = SDL_AndroidGetExternalStoragePath();
        std::filesystem::path res(prefPath);
        res.append("bootstrap.js");
        SDL_free((void *)prefPath);
        return res;
    }
}

int main(int argc, char **argv)
{
    if (SDL_Init(SDL_INIT_VIDEO) < 0)
    {
        ZERO_LOG_ERROR("SDL could not initialize! SDL_Error: %s", SDL_GetError());
        return 0;
    }

    // SDL_DisplayMode displayMode;
    // SDL_GetCurrentDisplayMode(0, &displayMode);

    std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window{
        SDL_CreateWindow("zero",                                   // window title
                         SDL_WINDOWPOS_UNDEFINED,                  // initial x position
                         SDL_WINDOWPOS_UNDEFINED,                  // initial y position
                         0,                                        // width, in pixels
                         0,                                        // height, in pixels
                         SDL_WINDOW_FULLSCREEN | SDL_WINDOW_VULKAN // flags
                         ),
        windowDeleter};

    Window::instance().loop(std::move(sdl_window));
    return 0;
}