#pragma once

#include "info.hpp"

namespace binding
{
    namespace gfx
    {
        class Device_impl;
        class Texture_impl;

        class Texture
        {
        private:
            std::unique_ptr<Texture_impl> _impl;

            std::shared_ptr<TextureInfo> _info;

        public:
            Texture_impl &impl() { return *_impl.get(); }

            const std::shared_ptr<TextureInfo> &info() { return _info; }

            Texture(Device_impl *device, bool swapchain = false);

            bool initialize(const std::shared_ptr<TextureInfo> &info);

            ~Texture();
        };
    }
}