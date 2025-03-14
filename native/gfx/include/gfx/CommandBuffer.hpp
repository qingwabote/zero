#pragma once

#include "DescriptorSet.hpp"
#include "PipelineLayout.hpp"
#include "Pipeline.hpp"
#include "Buffer.hpp"
#include "Texture.hpp"
#include "RenderPass.hpp"
#include "Framebuffer.hpp"

#include "ImageBitmap.hpp"

namespace gfx
{
    class DeviceImpl;
    class CommandBufferImpl;

    class CommandBuffer
    {
    public:
        const std::unique_ptr<CommandBufferImpl> impl;

        CommandBuffer(DeviceImpl *device);

        bool initialize();

        virtual void begin();
        virtual void copyImageBitmapToTexture(const std::shared_ptr<ImageBitmap> &imageBitmap, const std::shared_ptr<Texture> &texture);
        virtual void copyBufferToTexture(const std::shared_ptr<const Span> &span, uint32_t offset, const std::shared_ptr<Texture> &texture, uint32_t offset_x, uint32_t offset_y, uint32_t extent_x, uint32_t extent_y);
        virtual void beginRenderPass(const std::shared_ptr<RenderPass> &renderPass, const std::shared_ptr<Framebuffer> &framebuffer, int32_t x, int32_t y, uint32_t width, uint32_t height);
        virtual void bindDescriptorSet(uint32_t index, const std::shared_ptr<DescriptorSet> &descriptorSet, const std::shared_ptr<Uint32Vector> &dynamicOffsets = nullptr);
        virtual void bindInputAssembler(const std::shared_ptr<InputAssembler> &inputAssembler);
        virtual void bindPipeline(const std::shared_ptr<Pipeline> &pipeline);
        virtual void draw(uint32_t count, uint32_t firstVertex, uint32_t instanceCount);
        virtual void drawIndexed(uint32_t indexCount, uint32_t firstIndex, uint32_t instanceCount);
        virtual void endRenderPass();
        virtual void end();

        virtual ~CommandBuffer();
    };
}
