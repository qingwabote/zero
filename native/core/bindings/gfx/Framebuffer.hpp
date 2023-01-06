#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class Framebuffer_impl;

        class Framebuffer : public Binding
        {
        private:
            std::unique_ptr<Framebuffer_impl> _impl;

            sugar::v8::Weak<v8::Object> _info;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Framebuffer_impl &impl() { return *_impl.get(); }

            Framebuffer(std::unique_ptr<Framebuffer_impl> impl);

            bool initialize(v8::Local<v8::Object> info);

            ~Framebuffer();
        };
    }
}