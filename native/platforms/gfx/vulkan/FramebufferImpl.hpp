#pragma once

#include "DeviceImpl.hpp"

namespace gfx
{
    class FramebufferImpl
    {
        friend class Framebuffer;

    private:
        DeviceImpl *_device = nullptr;

        std::vector<VkFramebuffer> _framebuffers;

    public:
        FramebufferImpl(DeviceImpl *device);

        bool isSwapchain() { return _framebuffers.size() > 1; }

        operator VkFramebuffer() { return isSwapchain() ? _framebuffers[_device->swapchainImageIndex()] : _framebuffers[0]; }

        ~FramebufferImpl();
    };

}
