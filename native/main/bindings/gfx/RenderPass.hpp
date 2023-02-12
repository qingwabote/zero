#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class RenderPass_impl;

        class RenderPass : public Binding
        {
        private:
            std::unique_ptr<RenderPass_impl> _impl;

            sugar::v8::Weak<v8::Object> _info;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            RenderPass_impl &impl() { return *_impl.get(); }

            v8::Local<v8::Object> info() { return _info.Get(v8::Isolate::GetCurrent()); }

            RenderPass(std::unique_ptr<RenderPass_impl> impl);

            bool initialize(v8::Local<v8::Object> info);

            ~RenderPass();
        };
    }
}