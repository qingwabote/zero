#pragma once

#include "Binding.hpp"

namespace binding::gfx
{
    class InputAssembler_impl;

    class InputAssembler : public Binding
    {
    private:
        std::unique_ptr<InputAssembler_impl> _impl;

        sugar::v8::Weak<v8::Object> _info;

    protected:
        v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        InputAssembler_impl &impl() { return *_impl.get(); }

        InputAssembler(std::unique_ptr<InputAssembler_impl> impl);

        bool initialize(v8::Local<v8::Object> info);

        ~InputAssembler();
    };
}
