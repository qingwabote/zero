#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class Buffer_impl;

        class Buffer : public Binding
        {
        private:
            std::unique_ptr<Buffer_impl> _impl;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Buffer_impl *impl() { return _impl.get(); }

            Buffer(std::unique_ptr<Buffer_impl> impl);

            v8::Local<v8::Object> info();

            bool initialize(v8::Local<v8::Object> info);

            void update(v8::Local<v8::ArrayBufferView> buffer);

            ~Buffer();
        };
    }
}