#pragma once

#include "gfx/CommandBuffer.hpp"
#include "base/TaskRunner.hpp"

namespace bg
{
    class CommandBuffer : public gfx::CommandBuffer
    {
    private:
        TaskRunner *_background{nullptr};

    public:
        CommandBuffer(gfx::DeviceImpl *device, TaskRunner *background);

        virtual void begin() override;
        virtual void copyImageBitmapToTexture(const std::shared_ptr<ImageBitmap> &imageBitmap, const std::shared_ptr<gfx::Texture> &texture) override;
        virtual void copyBufferToTexture(const std::shared_ptr<const gfx::Span> &span, uint32_t offset, const std::shared_ptr<gfx::Texture> &texture, uint32_t offset_x, uint32_t offset_y, uint32_t extent_x, uint32_t extent_y) override;
        virtual void beginRenderPass(const std::shared_ptr<gfx::RenderPass> &renderPass, const std::shared_ptr<gfx::Framebuffer> &framebuffer, int32_t x, int32_t y, uint32_t width, uint32_t height) override;
        virtual void bindDescriptorSet(uint32_t index, const std::shared_ptr<gfx::DescriptorSet> &descriptorSet, const std::shared_ptr<gfx::Uint32Vector> &dynamicOffsets) override;
        virtual void bindInputAssembler(const std::shared_ptr<gfx::InputAssembler> &inputAssembler) override;
        virtual void bindPipeline(const std::shared_ptr<gfx::Pipeline> &pipeline) override;
        virtual void draw(uint32_t count, uint32_t firstVertex, uint32_t instanceCount) override;
        virtual void drawIndexed(uint32_t indexCount, uint32_t firstIndex, uint32_t instanceCount) override;
        virtual void endRenderPass() override;
        virtual void end() override;
    };
}