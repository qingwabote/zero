#include <stdio.h>
#include <SDL.h>
#include "v8.h"
#include "libplatform/libplatform.h"

int main(int argc, char **argv)
{
    auto platform = v8::platform::NewDefaultPlatform();
    SDL_Log("Hello, v8!\n");
    return 0;
}