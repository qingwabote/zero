#pragma once

#include <memory>

// corresponds to the web API ImageBitmap
// https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap
class ImageBitmap
{
public:
    const std::unique_ptr<void, void (*)(void *)> pixels;
    const int width;
    const int height;

    ImageBitmap(std::unique_ptr<void, void (*)(void *)> pixels, int width, int height) : pixels(std::move(pixels)), width(width), height(height) {}

    ~ImageBitmap() {}
};