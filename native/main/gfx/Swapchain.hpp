#pragma once

#include "Texture.hpp"
#include "Semaphore.hpp"

namespace gfx
{
    class DeviceImpl;
    class SwapchainImpl;

    /** a fake swap chain with fake texture */
    class Swapchain
    {
    private:
        std::unique_ptr<SwapchainImpl> _impl;

    public:
        const std::shared_ptr<Texture> colorTexture;

        const uint32_t width;
        const uint32_t height;

        Swapchain(DeviceImpl *device);

        void acquire(const std::shared_ptr<Semaphore> &semaphore);

        ~Swapchain();
    };
}
