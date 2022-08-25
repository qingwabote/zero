#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class CommandBuffer : public Binding
        {
        private:
            class Impl;
            Impl *_impl = nullptr;

        protected:
            virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            CommandBuffer(v8::Isolate *isolate);

            ~CommandBuffer();
        };
    }
}