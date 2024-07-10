#pragma once

#include "gfx/Device.hpp"
#include "base/threading/ThreadPool.hpp"

namespace bg
{
    class Device : public gfx::Device
    {
    private:
        std::unique_ptr<ThreadPool> _background{new ThreadPool(1)};

    protected:
        virtual std::unique_ptr<gfx::Queue> getQueue() override;

    public:
        Device(SDL_Window *window);

        gfx::CommandBuffer *createCommandBuffer() override;

        virtual void waitForFence(const std::shared_ptr<gfx::Fence> &fence);

        void finish() override;
    };
}