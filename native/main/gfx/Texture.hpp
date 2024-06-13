#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Texture_impl;

    class Texture
    {
    private:
        std::shared_ptr<Texture_impl> _impl;

    public:
        const std::shared_ptr<Texture_impl> &impl() { return _impl; }

        const std::shared_ptr<TextureInfo> &info;

        Texture(Device_impl *device, const std::shared_ptr<TextureInfo> &info, bool swapchain = false);

        bool initialize();

        ~Texture();
    };
}