#pragma once

#include "Binding.hpp"
#include "thirdparty/stb_image.h"

namespace binding
{
    class ImageBitmap : public Binding
    {
    private:
        stbi_uc *_pixels = nullptr;
        int _width;
        int _height;

    protected:
        virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        int width()
        {
            return _width;
        }

        int height()
        {
            return _height;
        }

        ImageBitmap(stbi_uc *pixels, int width, int height) : Binding(), _pixels(pixels), _width(width), _height(height) {}

        ~ImageBitmap()
        {
            stbi_image_free(_pixels);
        }
    };
}