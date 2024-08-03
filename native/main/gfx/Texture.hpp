#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class TextureImpl;

    class Texture
    {
    public:
        const std::shared_ptr<TextureImpl> impl;

        const std::shared_ptr<TextureInfo> &info;

        Texture(DeviceImpl *device, const std::shared_ptr<TextureInfo> &info, bool swapchain = false);

        bool initialize();

        ~Texture();
    };
}