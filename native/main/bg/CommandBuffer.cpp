#include "CommandBuffer.hpp"

namespace bg
{
    CommandBuffer::CommandBuffer(gfx::DeviceImpl *device, TaskRunner *background) : gfx::CommandBuffer(device), _background(background) {}

    void CommandBuffer::begin()
    {
        _background->post([=]()
                          { gfx::CommandBuffer::begin(); });
    }

    void CommandBuffer::copyImageBitmapToTexture(const std::shared_ptr<ImageBitmap> &imageBitmap, const std::shared_ptr<gfx::Texture> &texture)
    {
        _background->post([=]()
                          { gfx::CommandBuffer::copyImageBitmapToTexture(imageBitmap, texture); });
    }

    void CommandBuffer::copyBufferToTexture(const std::shared_ptr<const gfx::Span> &span, uint32_t offset, const std::shared_ptr<gfx::Texture> &texture, uint32_t offset_x, uint32_t offset_y, uint32_t extent_x, uint32_t extent_y)
    {
        _background->post([=]()
                          { gfx::CommandBuffer::copyBufferToTexture(span, offset, texture, offset_x, offset_y, extent_x, extent_y); });
    }

    void CommandBuffer::beginRenderPass(const std::shared_ptr<gfx::RenderPass> &renderPass, const std::shared_ptr<gfx::Framebuffer> &framebuffer, int32_t x, int32_t y, uint32_t width, uint32_t height)
    {
        _background->post([=]()
                          { gfx::CommandBuffer::beginRenderPass(renderPass, framebuffer, x, y, width, height); });
    }

    void CommandBuffer::bindDescriptorSet(uint32_t index, const std::shared_ptr<gfx::DescriptorSet> &descriptorSet, const std::shared_ptr<gfx::Uint32Vector> &dynamicOffsets)
    {
        _background->post([=]()
                          { gfx::CommandBuffer::bindDescriptorSet(index, descriptorSet, dynamicOffsets); });
    }

    void CommandBuffer::bindInputAssembler(const std::shared_ptr<gfx::InputAssembler> &inputAssembler)
    {
        _background->post([=]()
                          { gfx::CommandBuffer::bindInputAssembler(inputAssembler); });
    }

    void CommandBuffer::bindPipeline(const std::shared_ptr<gfx::Pipeline> &pipeline)
    {
        _background->post([=]()
                          { gfx::CommandBuffer::bindPipeline(pipeline); });
    }

    void CommandBuffer::draw(uint32_t count, uint32_t firstVertex, uint32_t instanceCount)
    {
        _background->post([=]()
                          { gfx::CommandBuffer::draw(count, firstVertex, instanceCount); });
    }

    void CommandBuffer::drawIndexed(uint32_t indexCount, uint32_t firstIndex, uint32_t instanceCount)
    {
        _background->post([=]()
                          { gfx::CommandBuffer::drawIndexed(indexCount, firstIndex, instanceCount); });
    }

    void CommandBuffer::endRenderPass()
    {
        _background->post([=]()
                          { gfx::CommandBuffer::endRenderPass(); });
    }

    void CommandBuffer::end()
    {
        _background->post([=]()
                          { gfx::CommandBuffer::end(); });
    }
}