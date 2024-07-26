#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class QueueImpl;

    class Queue
    {
    private:
        std::unique_ptr<QueueImpl> _impl;

    public:
        Queue(DeviceImpl *device);

        virtual void submit(const std::shared_ptr<SubmitInfo> &info, const std::shared_ptr<Fence> &fence);
        virtual void present(const std::shared_ptr<Semaphore> &waitSemaphore);

        virtual ~Queue();
    };
}
