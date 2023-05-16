#include "log.h"
#include "env.hpp"
#include "SDL.h"
#include <windows.h>
#include "Window.hpp"
#include <thread>

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
        auto prefPath = SDL_GetPrefPath(nullptr, "zero");
        std::filesystem::path res(prefPath);
        res.append("bootstrap.js");
        SDL_free(prefPath);
        return res;
    }
}

int WINAPI WinMain(
    _In_ HINSTANCE hInstance,
    _In_opt_ HINSTANCE hPrevInstance,
    _In_ LPSTR lpCmdLine,
    _In_ int nCmdShow)
{
    AllocConsole();
    // system("chcp 65001");
    FILE *stream = nullptr;
    // freopen_s(&stream, "conin$", "r+t", stdin);
    freopen_s(&stream, "conout$", "w+t", stdout);
    freopen_s(&stream, "conout$", "w+t", stderr);

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
    {
        std::this_thread::sleep_for(std::chrono::nanoseconds(30000000000));
    }
    return nCmdShow;
}