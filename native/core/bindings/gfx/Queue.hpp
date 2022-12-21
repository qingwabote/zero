#pragma once

#include "Binding.hpp"
#include "Fence.hpp"
#include "Semaphore.hpp"
#include "CommandBuffer.hpp"

namespace binding::gfx
{
    struct SubmitInfo
    {
        Semaphore *waitSemaphore;
        int32_t waitDstStageMask;
        Semaphore *signalSemaphore;
        CommandBuffer *commandBuffer;
    };

    class Queue_impl;

    class Queue : public Binding
    {
    private:
        std::unique_ptr<Queue_impl> _impl;

    protected:
        v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Queue(std::unique_ptr<Queue_impl> impl);

        void submit(SubmitInfo &info, Fence *fence);

        void present(Semaphore *waitSemaphore);

        void waitFence(Fence *fence);

        ~Queue();
    };
}
