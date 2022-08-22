#include "bindings/gfx/device.hpp"

namespace binding
{
    namespace gfx
    {
        Device::Device(SDL_Window *window)
        {
        }

        Device::~Device()
        {
            printf("Device::~Device()");
        }
    }
}
