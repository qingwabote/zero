// corresponds to the web API ImageBitmap
// https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap

#pragma once

#include "Binding.hpp"
#include "thirdparty/stb_image.h"

namespace binding
{
    class ImageBitmap : public Binding
    {
    private:
        unsigned char *_pixels = nullptr;
        int _width;
        int _height;

    protected:
        virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        unsigned char *pixels() { return _pixels; }

        int width() { return _width; }

        int height() { return _height; }

        ImageBitmap(unsigned char *pixels, int width, int height) : Binding(), _pixels(pixels), _width(width), _height(height) {}

        ~ImageBitmap() { stbi_image_free(_pixels); }
    };
}