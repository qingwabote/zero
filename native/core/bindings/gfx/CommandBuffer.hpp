#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class CommandBufferImpl;

        class CommandBuffer : public Binding
        {
        private:
            std::unique_ptr<CommandBufferImpl> _impl;

        protected:
            virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            CommandBuffer(v8::Isolate *isolate, std::unique_ptr<CommandBufferImpl> impl);

            ~CommandBuffer();
        };
    }
}