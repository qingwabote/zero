#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Texture_impl;

    class Texture
    {
    public:
        const std::shared_ptr<Texture_impl> impl;

        const std::shared_ptr<TextureInfo> &info;

        Texture(Device_impl *device, const std::shared_ptr<TextureInfo> &info, bool swapchain = false);

        bool initialize();

        ~Texture();
    };
}