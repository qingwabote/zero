#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class PipelineImpl;

        class Pipeline : public Binding
        {
        private:
            std::unique_ptr<PipelineImpl> _impl;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Pipeline(v8::Isolate *isolate, std::unique_ptr<PipelineImpl> impl);

            bool initialize(v8::Local<v8::Object> info);

            ~Pipeline();
        };
    }
}
