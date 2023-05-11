#include "SDL.h"
#include "SDL_system.h"
#include "env.hpp"
#include "Window.hpp"

namespace env
{
    std::filesystem::path bootstrapJs()
    {
        auto prefPath = SDL_AndroidGetExternalStoragePath();
        std::filesystem::path res(prefPath);
        res.append("bootstrap.js");
        SDL_free((void *) prefPath);
        return res;
    }
}

int main(int argc, char **argv)
{
    Window::instance().loop();
    return 0;
}