#include <stdio.h>
#include <SDL.h>
#include "v8.h"
#include "libplatform/libplatform.h"
#include "glslang/Public/ShaderLang.h"

int main(int argc, char **argv)
{
    glslang::InitializeProcess();
    SDL_Log("Hello, glslang!\n");
    return 0;
}