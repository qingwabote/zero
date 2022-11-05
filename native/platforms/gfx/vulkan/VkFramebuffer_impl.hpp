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

            VkFramebuffer _framebuffer = nullptr;

        public:
            Framebuffer_impl(Device_impl *device);

            operator VkFramebuffer() { return _framebuffer; }

            ~Framebuffer_impl();
        };

    }
}
