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

            sugar::v8::Weak<v8::Object> _info;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Texture_impl &impl() { return *_impl.get(); }

            v8::Local<v8::Object> info() { return _info.Get(v8::Isolate::GetCurrent()); }

            Texture(std::unique_ptr<Texture_impl> impl);

            bool initialize(v8::Local<v8::Object> info);

            ~Texture();
        };
    }
}