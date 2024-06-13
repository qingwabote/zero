#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Framebuffer_impl;

    class Framebuffer
    {
    private:
        std::unique_ptr<Framebuffer_impl> _impl;

    public:
        Framebuffer_impl &impl() { return *_impl; }

        const std::shared_ptr<FramebufferInfo> info;

        Framebuffer(Device_impl *device, const std::shared_ptr<FramebufferInfo> &info);

        bool initialize();

        ~Framebuffer();
    };
}
