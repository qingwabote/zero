#pragma once

#include <memory>

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