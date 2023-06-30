#pragma once

#include "Texture.hpp"

namespace binding::gfx
{
    /** a fake swap chain with fake texture */
    class Swapchain
    {
    private:
        std::shared_ptr<Texture> _colorTexture;

    public:
        const std::shared_ptr<Texture> &colorTexture() { return _colorTexture; }

        Swapchain(std::shared_ptr<Texture> colorTexture) : _colorTexture(std::move(colorTexture)){};
    };
}
