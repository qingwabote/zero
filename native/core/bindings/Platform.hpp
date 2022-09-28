#pragma once

#include "Binding.hpp"

namespace binding
{
    class Platform : public Binding
    {
    protected:
        virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Platform() : Binding() {}

        v8::Local<v8::Promise> decodeImage(v8::Local<v8::ArrayBuffer> buffer);

        ~Platform() {}
    };
}