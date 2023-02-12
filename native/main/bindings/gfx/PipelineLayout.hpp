#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class PipelineLayout_impl;

        class PipelineLayout : public Binding
        {
        private:
            std::unique_ptr<PipelineLayout_impl> _impl;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            PipelineLayout_impl &impl() { return *_impl.get(); }

            PipelineLayout(std::unique_ptr<PipelineLayout_impl> impl);

            bool initialize(v8::Local<v8::Array> setLayouts);

            ~PipelineLayout();
        };

    }
}