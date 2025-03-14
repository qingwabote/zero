#include "Device.hpp"
#include "CommandBuffer.hpp"
#include "Queue.hpp"
#include <future>

namespace bg
{
    Device::Device(SDL_Window *window, std::function<void()> &&debugMessengerCallback) : gfx::Device(window, std::move(debugMessengerCallback))
    {
        _bg_thread = std::thread(
            [this]()
            {
                std::unique_ptr<bastard::Lambda<void>> f{};
                while (_bg_running.load(std::memory_order_relaxed))
                {
                    _bg_queue.pop(f, true);
                    f->call();
                }
            });
    };

    std::unique_ptr<gfx::Queue> Device::getQueue() { return std::make_unique<Queue>(_impl, this); }

    gfx::CommandBuffer *Device::createCommandBuffer()
    {
        auto commandBuffer = new CommandBuffer(_impl, this);
        commandBuffer->initialize();
        return commandBuffer;
    }

    void Device::waitForFence(const std::shared_ptr<gfx::Fence> &fence)
    {
        std::promise<void> promise;
        std::future<void> future = promise.get_future();
        post([=, &promise]()
             {
            gfx::Device::waitForFence(fence);
            promise.set_value(); });
        future.get();
    }

    void Device::finish()
    {
        _bg_running.store(false, std::memory_order_relaxed);
        // wake the blocked threads up
        post([=]()
             {
                 // do nothing
             });
        _bg_thread.join();

        gfx::Device::finish();
    }

    void Device::post(std::unique_ptr<bastard::Lambda<void>> &&lambda)
    {
        _bg_queue.push(std::move(lambda));
    }
}