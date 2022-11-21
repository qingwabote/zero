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

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Framebuffer_impl &impl() { return *_impl.get(); }

            v8::Local<v8::Object> info() { return retrieve("info"); }

            Framebuffer(std::unique_ptr<Framebuffer_impl> impl);

            bool initialize(v8::Local<v8::Object> info);

            ~Framebuffer();
        };
    }
}