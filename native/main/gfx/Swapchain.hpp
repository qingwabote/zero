#pragma once

#include "Texture.hpp"

namespace gfx
{
    /** a fake swap chain with fake texture */
    class Swapchain
    {
    private:
        std::shared_ptr<Texture> _colorTexture;

        uint32_t _width;
        uint32_t _height;

    public:
        const std::shared_ptr<Texture> &colorTexture() { return _colorTexture; }

        uint32_t width() { return _width; }
        uint32_t height() { return _height; }

        Swapchain(std::shared_ptr<Texture> colorTexture, uint32_t width, uint32_t height)
            : _colorTexture(std::move(colorTexture)), _width(width), _height(height){};
    };
}
