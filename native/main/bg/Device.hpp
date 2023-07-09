#pragma once

#include "gfx/Device.hpp"
#include "base/threading/ThreadPool.hpp"

namespace bg
{
    class Device : public gfx::Device
    {
    private:
        std::unique_ptr<ThreadPool> _background{new ThreadPool(1)};

    public:
        Device(SDL_Window *window);

        gfx::CommandBuffer *createCommandBuffer() override;
        gfx::Queue *createQueue() override;

        void finish() override;
    };
}