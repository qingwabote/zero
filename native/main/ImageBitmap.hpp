#pragma once

#include <memory>

// corresponds to the web API ImageBitmap
// https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap
class ImageBitmap
{
private:
    std::unique_ptr<void, void (*)(void *)> _pixels;
    int _width;
    int _height;

public:
    void *pixels() { return _pixels.get(); }

    int width() { return _width; }

    int height() { return _height; }

    ImageBitmap(std::unique_ptr<void, void (*)(void *)> pixels, int width, int height) : _pixels(std::move(pixels)), _width(width), _height(height) {}

    ~ImageBitmap() {}
};