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

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            RenderPass_impl &impl() { return *_impl.get(); }

            v8::Local<v8::Object> info() { return retrieve("info"); }

            RenderPass(std::unique_ptr<RenderPass_impl> impl);

            bool initialize(v8::Local<v8::Object> info);

            ~RenderPass();
        };
    }
}