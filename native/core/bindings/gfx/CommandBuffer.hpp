#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class CommandBuffer_impl;

        class CommandBuffer : public Binding
        {
        private:
            std::unique_ptr<CommandBuffer_impl> _impl;

        protected:
            virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            CommandBuffer(std::unique_ptr<CommandBuffer_impl> impl);

            bool initialize();

            void begin();

            void beginRenderPass(v8::Local<v8::Object> area);

            ~CommandBuffer();
        };
    }
}