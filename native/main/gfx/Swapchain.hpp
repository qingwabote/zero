#pragma once

#include "Texture.hpp"
#include "Semaphore.hpp"

namespace gfx
{
    class Device_impl;
    class Swapchain_impl;

    /** a fake swap chain with fake texture */
    class Swapchain
    {
    private:
        std::unique_ptr<Swapchain_impl> _impl;

    public:
        const std::shared_ptr<Texture> colorTexture;

        const uint32_t width;
        const uint32_t height;

        Swapchain(Device_impl *device);

        void acquire(const std::shared_ptr<Semaphore> &semaphore);

        ~Swapchain();
    };
}
