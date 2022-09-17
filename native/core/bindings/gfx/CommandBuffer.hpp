#pragma once

#include "Binding.hpp"
#include "DescriptorSet.hpp"
#include "PipelineLayout.hpp"
#include "Pipeline.hpp"

namespace binding
{
    namespace gfx
    {
        class CommandBuffer_impl;

        class CommandBuffer : public Binding
        {
        private:
            std::unique_ptr<CommandBuffer_impl> _impl;

        protected:
            virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            CommandBuffer(std::unique_ptr<CommandBuffer_impl> impl);

            bool initialize();

            void begin();

            void beginRenderPass(v8::Local<v8::Object> area);

            void bindDescriptorSet(PipelineLayout *pipelineLayout, uint32_t index, DescriptorSet *descriptorSet);

            void bindInputAssembler(v8::Local<v8::Object> inputAssembler);

            void bindPipeline(v8::Local<v8::Object> pipeline);

            void draw();

            ~CommandBuffer();
        };
    }
}