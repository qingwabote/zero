#include "Device.hpp"
#include "CommandBuffer.hpp"
#include "Queue.hpp"

namespace bg
{
    Device::Device(SDL_Window *window) : gfx::Device(window){};

    std::unique_ptr<gfx::Queue> Device::getQueue() { return std::make_unique<Queue>(_impl, _background.get()); }

    gfx::CommandBuffer *Device::createCommandBuffer()
    {
        auto commandBuffer = new CommandBuffer(_impl, _background.get());
        commandBuffer->initialize();
        return commandBuffer;
    }

    void Device::finish()
    {
        _background->join();
        gfx::Device::finish();
    }
}