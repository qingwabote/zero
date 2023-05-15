#pragma once

#include "Binding.hpp"
#include "DescriptorSet.hpp"

namespace binding
{
    namespace gfx
    {
        class DescriptorSetLayout_impl;
        class DescriptorSetLayout : public Binding
        {
        private:
            std::unique_ptr<DescriptorSetLayout_impl> _impl;

            sugar::v8::Weak<v8::Object> _bindings;

        protected:
            virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            DescriptorSetLayout_impl *impl() { return _impl.get(); }

            DescriptorSetLayout(std::unique_ptr<DescriptorSetLayout_impl> impl);

            bool initialize(v8::Local<v8::Array> js_layoutBindings);

            DescriptorSet *createDescriptorSet();

            ~DescriptorSetLayout();
        };
    }
}