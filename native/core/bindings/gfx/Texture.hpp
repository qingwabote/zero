#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class Texture_impl;

        class Texture : public Binding
        {
        private:
            std::unique_ptr<Texture_impl> _impl;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Texture_impl &impl() { return *_impl.get(); }

            v8::Local<v8::Object> info() { return retrieve("info"); }

            Texture(std::unique_ptr<Texture_impl> impl);

            bool initialize(v8::Local<v8::Object> info);

            ~Texture();
        };
    }
}