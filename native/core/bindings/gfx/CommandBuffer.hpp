#pragma once

#include "Binding.hpp"
#include "DescriptorSet.hpp"
#include "PipelineLayout.hpp"
#include "Pipeline.hpp"
#include "Buffer.hpp"
#include "Texture.hpp"
#include "RenderPass.hpp"
#include "Framebuffer.hpp"

#include "bindings/ImageBitmap.hpp"

namespace binding::gfx
{
    struct RenderArea
    {
        int32_t x;
        int32_t y;
        int32_t width;
        int32_t height;
    };

    struct VertexInput
    {
        std::vector<Buffer *> vertexBuffers;
        std::vector<uint32_t> vertexOffsets;
        Buffer *indexBuffer;
        int32_t indexType;
        uint32_t indexCount;
        uint32_t indexOffset;
    };

    struct InputAssembler
    {
        VertexInput vertexInput;
    };

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

        void copyBuffer(const void *src, Buffer *dstBuffer, size_t size);

        void copyImageBitmapToTexture(ImageBitmap *imageBitmap, Texture *texture);

        void begin();

        void beginRenderPass(RenderPass *renderPass, Framebuffer *framebuffer, RenderArea &area);

        void bindDescriptorSet(PipelineLayout *pipelineLayout,
                               uint32_t index,
                               DescriptorSet *descriptorSet,
                               std::vector<uint32_t> &dynamicOffsets);

        void bindInputAssembler(InputAssembler &inputAssembler);

        void bindPipeline(Pipeline *pipeline);

        void draw();

        void endRenderPass();

        void end();

        ~CommandBuffer();
    };
}
