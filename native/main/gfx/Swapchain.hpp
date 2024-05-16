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

        std::shared_ptr<Texture> _colorTexture;

        uint32_t _width;
        uint32_t _height;

    public:
        const std::shared_ptr<Texture> &colorTexture() { return _colorTexture; }

        uint32_t width() { return _width; }
        uint32_t height() { return _height; }

        Swapchain(Device_impl *device);

        void acquire(const std::shared_ptr<Semaphore> &semaphore);

        ~Swapchain();
    };
}
