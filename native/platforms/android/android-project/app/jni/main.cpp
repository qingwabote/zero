#include "log.h"
#include "SDL.h"
#include "env.hpp"
#include "Window.hpp"
#include "gfx/vulkan/tests/triangle.hpp"

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

    // Window::instance().loop(std::move(sdl_window));
    tests::triangle::draw(std::move(sdl_window));
    return 0;
}