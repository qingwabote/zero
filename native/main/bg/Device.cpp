#include "Device.hpp"
#include "CommandBuffer.hpp"
#include "Queue.hpp"
#include <future>

namespace bg
{
    Device::Device(SDL_Window *window) : gfx::Device(window)
    {
        _bg_thread = std::thread(
            [this]()
            {
                std::unique_ptr<callable::Callable<void>> f{};
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
        auto f = new auto(
            [=, &promise]()
            {
                gfx::Device::waitForFence(fence);
                promise.set_value();
            });
        post(f);
        future.get();
    }

    void Device::finish()
    {
        _bg_running.store(false, std::memory_order_relaxed);
        auto nudge = new auto(
            [=]()
            {
                // do nothing
            });
        post(nudge); // wake the blocked threads up
        _bg_thread.join();

        gfx::Device::finish();
    }

    void Device::post(std::unique_ptr<callable::Callable<void>> &&callable)
    {
        _bg_queue.push(std::forward<std::unique_ptr<callable::Callable<void>>>(callable));
    }
}