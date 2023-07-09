#pragma once

#include "gfx/Queue.hpp"
#include "base/TaskRunner.hpp"

namespace bg
{
    class Queue : public gfx::Queue
    {
    private:
        TaskRunner *_background{nullptr};

    public:
        Queue(gfx::Device_impl *device, TaskRunner *background);

        virtual void submit(const std::shared_ptr<gfx::SubmitInfo> &info, const std::shared_ptr<gfx::Fence> &fence);
        virtual void present(const std::shared_ptr<gfx::Semaphore> &waitSemaphore);
        virtual void waitFence(const std::shared_ptr<gfx::Fence> &fence);
    };
}