// #include <tchar.h>
#include <windows.h>
#include <iostream>
#include "SDL.h"
#include "volk.h"

int WINAPI WinMain(
    _In_ HINSTANCE hInstance,
    _In_opt_ HINSTANCE hPrevInstance,
    _In_ LPSTR lpCmdLine,
    _In_ int nCmdShow)
{
    if (volkInitialize())
    {
        printf("Failed to initialize volk");
        return -1;
    }
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        printf("SDL could not initialize! SDL_Error: %s\n", SDL_GetError());
        return -1;
    }
}