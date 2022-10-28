#pragma once

#include "Binding.hpp"

namespace binding
{
    class Performance : public Binding
    {
    protected:
        virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Performance() : Binding(){};
        ~Performance(){};
    };
}