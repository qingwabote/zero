#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class BufferImpl;

        class Buffer : public Binding
        {
        private:
            std::unique_ptr<BufferImpl> _impl;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            BufferImpl *impl() { return _impl.get(); }

            Buffer(std::unique_ptr<BufferImpl> impl);

            v8::Local<v8::Object> info();

            bool initialize(v8::Local<v8::Object> info);

            void update(v8::Local<v8::ArrayBufferView> buffer);

            ~Buffer();
        };
    }
}