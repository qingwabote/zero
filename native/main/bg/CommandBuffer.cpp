#include "CommandBuffer.hpp"

namespace bg
{
    CommandBuffer::CommandBuffer(gfx::DeviceImpl *device, TaskRunner *background) : gfx::CommandBuffer(device), _background(background) {}

    void CommandBuffer::begin()
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::begin();
            });
        _background->post(f);
    }

    void CommandBuffer::copyImageBitmapToTexture(const std::shared_ptr<ImageBitmap> &imageBitmap, const std::shared_ptr<gfx::Texture> &texture)
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::copyImageBitmapToTexture(imageBitmap, texture);
            });
        _background->post(f);
    }

    void CommandBuffer::copyBufferToTexture(const std::shared_ptr<const gfx::Span> &span, uint32_t offset, const std::shared_ptr<gfx::Texture> &texture, uint32_t offset_x, uint32_t offset_y, uint32_t extent_x, uint32_t extent_y)
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::copyBufferToTexture(span, offset, texture, offset_x, offset_y, extent_x, extent_y);
            });
        _background->post(f);
    }

    void CommandBuffer::beginRenderPass(const std::shared_ptr<gfx::RenderPass> &renderPass, const std::shared_ptr<gfx::Framebuffer> &framebuffer, int32_t x, int32_t y, uint32_t width, uint32_t height)
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::beginRenderPass(renderPass, framebuffer, x, y, width, height);
            });
        _background->post(f);
    }

    void CommandBuffer::bindDescriptorSet(uint32_t index, const std::shared_ptr<gfx::DescriptorSet> &descriptorSet, const std::shared_ptr<gfx::Uint32Vector> &dynamicOffsets)
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::bindDescriptorSet(index, descriptorSet, dynamicOffsets);
            });
        _background->post(f);
    }

    void CommandBuffer::bindInputAssembler(const std::shared_ptr<gfx::InputAssembler> &inputAssembler)
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::bindInputAssembler(inputAssembler);
            });
        _background->post(f);
    }

    void CommandBuffer::bindPipeline(const std::shared_ptr<gfx::Pipeline> &pipeline)
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::bindPipeline(pipeline);
            });
        _background->post(f);
    }

    void CommandBuffer::draw(uint32_t count, uint32_t firstVertex, uint32_t instanceCount)
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::draw(count, firstVertex, instanceCount);
            });
        _background->post(f);
    }

    void CommandBuffer::drawIndexed(uint32_t indexCount, uint32_t firstIndex, uint32_t instanceCount)
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::drawIndexed(indexCount, firstIndex, instanceCount);
            });
        _background->post(f);
    }

    void CommandBuffer::endRenderPass()
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::endRenderPass();
            });
        _background->post(f);
    }

    void CommandBuffer::end()
    {
        auto f = new auto(
            [=]()
            {
                gfx::CommandBuffer::end();
            });
        _background->post(f);
    }
}