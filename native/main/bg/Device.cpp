#include "Device.hpp"
#include "CommandBuffer.hpp"
#include "Queue.hpp"
#include <future>

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

    void Device::waitForFence(const std::shared_ptr<gfx::Fence> &fence)
    {
        std::promise<void> promise;
        std::future<void> future = promise.get_future();
        auto f = new auto(
            [=, &promise]()
            {
                gfx::Device::waitForFence(fence);
                promise.set_value();
            });
        _background->post(f);
        future.get();
    }

    void Device::finish()
    {
        _background->join();
        gfx::Device::finish();
    }
}