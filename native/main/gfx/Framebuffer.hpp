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

        std::shared_ptr<FramebufferInfo> _info;

    public:
        Framebuffer_impl &impl() { return *_impl; }

        const std::shared_ptr<FramebufferInfo> &info() { return _info; };

        Framebuffer(Device_impl *device);

        bool initialize(const std::shared_ptr<FramebufferInfo> &info);

        ~Framebuffer();
    };
}
