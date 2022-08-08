// #include <tchar.h>
#include <windows.h>
#include "Window.hpp"

int WINAPI WinMain(
    _In_ HINSTANCE hInstance,
    _In_opt_ HINSTANCE hPrevInstance,
    _In_ LPSTR lpCmdLine,
    _In_ int nCmdShow)
{
    return Window::instance()->loop();
}