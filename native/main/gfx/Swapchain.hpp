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
        SwapchainImpl *_impl;

    public:
        const std::shared_ptr<Texture> color;

        Swapchain(SwapchainImpl *impl);

        void acquire(const std::shared_ptr<Semaphore> &semaphore);

        ~Swapchain();
    };
}
