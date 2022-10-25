// #include <tchar.h>
#include <windows.h>
#include "Window.hpp"
#include <thread>

int WINAPI WinMain(
    _In_ HINSTANCE hInstance,
    _In_opt_ HINSTANCE hPrevInstance,
    _In_ LPSTR lpCmdLine,
    _In_ int nCmdShow)
{
    AllocConsole();
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