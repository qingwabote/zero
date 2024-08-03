#include "Queue.hpp"

namespace bg
{
    Queue::Queue(gfx::DeviceImpl *device, TaskRunner *background) : gfx::Queue(device), _background(background) {}

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
}