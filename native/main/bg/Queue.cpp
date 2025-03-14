#include "Queue.hpp"

namespace bg
{
    Queue::Queue(gfx::DeviceImpl *device, TaskRunner *background) : gfx::Queue(device), _background(background) {}

    void Queue::submit(const std::shared_ptr<gfx::SubmitInfo> &info, const std::shared_ptr<gfx::Fence> &fence)
    {
        _background->post([=]()
                          { gfx::Queue::submit(info, fence); });
    }

    void Queue::present(const std::shared_ptr<gfx::Semaphore> &waitSemaphore)
    {
        _background->post([=]()
                          { gfx::Queue::present(waitSemaphore); });
    }
}