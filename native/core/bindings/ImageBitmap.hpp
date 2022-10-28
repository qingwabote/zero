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
        std::unique_ptr<void, void (*)(void *)> _pixels;
        int _width;
        int _height;

    protected:
        virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        void *pixels() { return _pixels.get(); }

        int width() { return _width; }

        int height() { return _height; }

        ImageBitmap(std::unique_ptr<void, void (*)(void *)> &pixels, int width, int height) : Binding(), _pixels(std::move(pixels)), _width(width), _height(height) {}

        ~ImageBitmap() {}
    };
}