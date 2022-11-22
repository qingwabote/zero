#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class Framebuffer_impl
        {
            friend class Framebuffer;

        private:
            Device_impl *_device = nullptr;

            std::vector<VkFramebuffer> _framebuffers;

        public:
            Framebuffer_impl(Device_impl *device);

            bool isSwapchain() { return _framebuffers.size() > 1; }

            operator VkFramebuffer() { return isSwapchain() ? _framebuffers[_device->swapchainImageIndex()] : _framebuffers[0]; }

            ~Framebuffer_impl();
        };

    }
}
