#pragma once

#include "Binding.hpp"

namespace binding
{
    namespace gfx
    {
        class Pipeline_impl;

        class Pipeline : public Binding
        {
        private:
            std::unique_ptr<Pipeline_impl> _impl;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Pipeline_impl &impl() { return *_impl.get(); }

            Pipeline(std::unique_ptr<Pipeline_impl> impl);

            bool initialize(v8::Local<v8::Object> info);

            ~Pipeline();
        };
    }
}
