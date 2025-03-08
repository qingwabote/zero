#pragma once

#include <thread>
#include "gfx/Device.hpp"
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/TaskRunner.hpp"

namespace bg
{
    class Device : public gfx::Device, public TaskRunner
    {
    private:
        ThreadSafeQueue<std::unique_ptr<bastard::Lambda<void>>> _bg_queue;
        std::thread _bg_thread;
        std::atomic<bool> _bg_running{true};

    protected:
        virtual std::unique_ptr<gfx::Queue> getQueue() override;

        void post(std::unique_ptr<bastard::Lambda<void>> &&lambda) override;

    public:
        Device(SDL_Window *window, std::function<void()> &&debugMessengerCallback);

        gfx::CommandBuffer *createCommandBuffer() override;

        void waitForFence(const std::shared_ptr<gfx::Fence> &fence) override;

        void finish() override;

        using TaskRunner::post;
    };
}