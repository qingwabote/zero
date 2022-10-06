#pragma once

#include "Binding.hpp"
#include "DescriptorSet.hpp"
#include "PipelineLayout.hpp"
#include "Pipeline.hpp"
#include "Texture.hpp"

#include "bindings/ImageBitmap.hpp"

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
            CommandBuffer_impl &impl() { return *_impl.get(); }

            CommandBuffer(std::unique_ptr<CommandBuffer_impl> impl);

            bool initialize();

            void copyImageBitmapToTexture(ImageBitmap *imageBitmap, Texture *texture);

            void begin();

            void beginRenderPass(v8::Local<v8::Object> area);

            void bindDescriptorSet(PipelineLayout *pipelineLayout,
                                   uint32_t index,
                                   DescriptorSet *descriptorSet,
                                   v8::Local<v8::Array> dynamicOffsets);

            void bindInputAssembler(v8::Local<v8::Object> inputAssembler);

            void bindPipeline(Pipeline *pipeline);

            void draw();

            void endRenderPass();

            void end();

            ~CommandBuffer();
        };
    }
}