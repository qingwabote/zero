#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Queue_impl;

    class Queue
    {
    private:
        std::unique_ptr<Queue_impl> _impl;

    public:
        Queue(Device_impl *device);

        virtual void submit(const std::shared_ptr<SubmitInfo> &info, const std::shared_ptr<Fence> &fence);
        virtual void present(const std::shared_ptr<Semaphore> &waitSemaphore);
        virtual void wait(const std::shared_ptr<Fence> &fence);

        virtual ~Queue();
    };
}
