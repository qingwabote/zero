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

        sugar::v8::Weak<v8::Object> _present_semaphore;

    protected:
        v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Queue(std::unique_ptr<Queue_impl> impl);

        void submit(const SubmitInfo &info, Fence *fence);

        void present(Semaphore *waitSemaphore);

        void waitFence(Fence *fence);

        ~Queue();
    };
}
