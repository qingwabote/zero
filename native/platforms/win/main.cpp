#include "log.h"
#include "env.hpp"
#include "SDL.h"
#include <windows.h>
#include "Window.hpp"
#include <thread>

// #include "../gfx/vulkan/tests/triangle.hpp"

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
    std::string bootstrap()
    {
        auto res = SDL_GetPrefPath(nullptr, "zero");
        std::string file(res);
        SDL_free(res);
        return file + "bootstrap.json";
    }
}

int WINAPI WinMain(
    _In_ HINSTANCE hInstance,
    _In_opt_ HINSTANCE hPrevInstance,
    _In_ LPSTR lpCmdLine,
    _In_ int nCmdShow)
{
    AllocConsole();

    freopen("conout$", "w", stdout);
    freopen("conout$", "w", stderr);

    if (SDL_Init(SDL_INIT_VIDEO) < 0)
    {
        ZERO_LOG_ERROR("SDL could not initialize! SDL_Error: %s", SDL_GetError());
        return nCmdShow;
    }

    std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window{
        SDL_CreateWindow("zero",                  // window title
                         SDL_WINDOWPOS_UNDEFINED, // initial x position
                         SDL_WINDOWPOS_UNDEFINED, // initial y position
                         640,                     // width, in pixels
                         960,                     // height, in pixels
                         SDL_WINDOW_VULKAN        // flags
                         ),
        windowDeleter};

    if (Window::instance().loop(std::move(sdl_window)))
    // if (test::triangle::draw(std::move(sdl_window)))
    {
        std::this_thread::sleep_for(std::chrono::nanoseconds(30000000000));
    }

    return nCmdShow;
}