#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class Sampler_impl;

        class Sampler : public Binding
        {
        private:
            std::unique_ptr<Sampler_impl> _impl;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Sampler_impl &impl() { return *_impl.get(); }

            Sampler(std::unique_ptr<Sampler_impl> impl);

            bool initialize(v8::Local<v8::Object> info);

            ~Sampler();
        };
    }
}