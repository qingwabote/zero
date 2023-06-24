#include "triangle.hpp"
#include "../VkDevice_impl.hpp"

namespace test::triangle
{
    bool draw(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window)
    {
        auto device = new binding::gfx::Device_impl(sdl_window.get());
        if (device->initialize())
        {
            return true;
        }

        return false;
    }
}