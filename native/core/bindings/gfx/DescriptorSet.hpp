#pragma once

#include "Binding.hpp"
#include "bindings/gfx/DescriptorSetLayout.hpp"
#include "bindings/gfx/Buffer.hpp"
#include "bindings/gfx/Texture.hpp"

namespace binding
{
    namespace gfx
    {
        class DescriptorSet_impl;
        class DescriptorSet : public Binding
        {
        private:
            std::unique_ptr<DescriptorSet_impl> _impl;

        protected:
            virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            DescriptorSet_impl &impl() { return *_impl.get(); }

            DescriptorSet(std::unique_ptr<DescriptorSet_impl> impl);

            bool initialize(DescriptorSetLayout *setLayout);

            void bindBuffer(uint32_t binding, Buffer *buffer, double range);

            void bindTexture(uint32_t binding, Texture *texture);

            ~DescriptorSet();
        };
    }
}