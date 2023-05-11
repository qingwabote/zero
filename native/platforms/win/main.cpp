#include "env.hpp"
#include "SDL_filesystem.h"
#include <windows.h>
#include "Window.hpp"
#include <thread>

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

    if (Window::instance().loop())
    {
        std::this_thread::sleep_for(std::chrono::nanoseconds(30000000000));
    }
    return nCmdShow;
}