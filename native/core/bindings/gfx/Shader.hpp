#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class ShaderImpl;

        class Shader : public Binding
        {
        private:
            std::unique_ptr<ShaderImpl> _impl;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Shader(std::unique_ptr<ShaderImpl> impl);

            v8::Local<v8::Object> info();

            bool initialize(v8::Local<v8::Object> info);

            ~Shader();
        };
    }
}