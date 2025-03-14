#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class FramebufferImpl;

    class Framebuffer
    {
    public:
        const std::unique_ptr<FramebufferImpl> impl;

        const std::shared_ptr<FramebufferInfo> info;

        Framebuffer(DeviceImpl *device, const std::shared_ptr<FramebufferInfo> &info);

        bool initialize();

        ~Framebuffer();
    };
}
