#include "log.h"
#include "env.hpp"
#include "SDL.h"
#include <windows.h>
#include "Window.hpp"
#include <thread>

// #include "../gfx/vulkan/tests/triangle.hpp"

namespace env
{
    std::string bootstrap(const char **err)
    {
        auto res = SDL_GetPrefPath(nullptr, "zero");
        std::string file(res);
        SDL_free(res);
        *err = nullptr;
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

    SDL_SetHint(SDL_HINT_WINDOWS_DPI_SCALING, "1");

    if (SDL_Init(SDL_INIT_VIDEO) < 0)
    {
        ZERO_LOG_ERROR("SDL could not initialize! SDL_Error: %s", SDL_GetError());
        return nCmdShow;
    }

    SDL_Window *sdl_window = SDL_CreateWindow("zero",
                                              SDL_WINDOWPOS_UNDEFINED,
                                              SDL_WINDOWPOS_UNDEFINED,
                                              640,
                                              960,
                                              SDL_WINDOW_VULKAN | SDL_WINDOW_ALLOW_HIGHDPI);

    if (Window::instance().loop(sdl_window))
    // if (test::triangle::draw(std::move(sdl_window)))
    {
        std::this_thread::sleep_for(std::chrono::nanoseconds(30000000000));
    }

    SDL_DestroyWindow(sdl_window);
    SDL_Quit();

    return nCmdShow;
}