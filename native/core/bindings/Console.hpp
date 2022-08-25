#pragma once

#include "Binding.hpp"

namespace binding
{
    class Console : public Binding
    {
    protected:
        virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Console(v8::Isolate *isolate) : Binding(isolate){};
        ~Console(){};
    };
}