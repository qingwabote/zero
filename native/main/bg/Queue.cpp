#include "Queue.hpp"
#include <future>

namespace bg
{
    Queue::Queue(gfx::Device_impl *device, TaskRunner *background) : gfx::Queue(device), _background(background) {}

    void Queue::submit(const std::shared_ptr<gfx::SubmitInfo> &info, const std::shared_ptr<gfx::Fence> &fence)
    {
        auto f = new auto(
            [=]()
            {
                gfx::Queue::submit(info, fence);
            });
        _background->post(f);
    }

    void Queue::present(const std::shared_ptr<gfx::Semaphore> &waitSemaphore)
    {
        auto f = new auto(
            [=]()
            {
                gfx::Queue::present(waitSemaphore);
            });
        _background->post(f);
    }

    void Queue::wait(const std::shared_ptr<gfx::Fence> &fence)
    {
        std::promise<void> promise;
        std::future<void> future = promise.get_future();
        auto f = new auto(
            [=, &promise]()
            {
                gfx::Queue::wait(fence);
                promise.set_value();
            });
        _background->post(f);
        future.get();
    }
}