#pragma once

#include <thread>
#include "gfx/Device.hpp"
#include "base/threading/readerwriterqueue/readerwriterqueue.h"
#include "base/TaskRunner.hpp"

namespace bg
{
    class Device : public gfx::Device, public TaskRunner
    {
    private:
        moodycamel::BlockingReaderWriterQueue<std::unique_ptr<callable::Callable<void>>> _bg_queue;
        std::thread _bg_thread;
        std::atomic<bool> _bg_running{true};

    protected:
        virtual std::unique_ptr<gfx::Queue> getQueue() override;

        void post(std::unique_ptr<callable::Callable<void>> &&callable) override;

    public:
        Device(SDL_Window *window);

        gfx::CommandBuffer *createCommandBuffer() override;

        virtual void waitForFence(const std::shared_ptr<gfx::Fence> &fence);

        void finish() override;

        using TaskRunner::post;
    };
}