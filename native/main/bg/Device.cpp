#include "Device.hpp"
#include "CommandBuffer.hpp"
#include "Queue.hpp"

namespace bg
{
    Device::Device(SDL_Window *window) : gfx::Device(window){};

    gfx::CommandBuffer *Device::createCommandBuffer() { return new CommandBuffer(_impl, _background.get()); }
    gfx::Queue *Device::createQueue() { return new Queue(_impl, _background.get()); }

    void Device::finish()
    {
        _background->join();
        gfx::Device::finish();
    }
}