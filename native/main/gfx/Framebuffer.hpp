#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Framebuffer_impl;

    class Framebuffer
    {
    public:
        const std::unique_ptr<Framebuffer_impl> impl;

        const std::shared_ptr<FramebufferInfo> info;

        Framebuffer(Device_impl *device, const std::shared_ptr<FramebufferInfo> &info);

        bool initialize();

        ~Framebuffer();
    };
}
