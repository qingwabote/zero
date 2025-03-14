#include "gfx/CommandBuffer.hpp"

#include "CommandBufferImpl.hpp"
#include "PipelineLayoutImpl.hpp"
#include "DescriptorSetImpl.hpp"
#include "BufferImpl.hpp"
#include "PipelineImpl.hpp"
#include "TextureImpl.hpp"
#include "RenderPassImpl.hpp"
#include "FramebufferImpl.hpp"

namespace gfx
{
    CommandBufferImpl::CommandBufferImpl(DeviceImpl *device) : _device(device) {}

    VkBuffer CommandBufferImpl::createStagingBuffer(void const *src, VkDeviceSize size)
    {
        VkBufferCreateInfo bufferInfo = {};
        bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
        bufferInfo.size = size;
        bufferInfo.usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;

        VmaAllocationCreateInfo allocationCreateInfo = {};
        allocationCreateInfo.usage = VMA_MEMORY_USAGE_CPU_ONLY;
        allocationCreateInfo.flags = VMA_ALLOCATION_CREATE_MAPPED_BIT;

        VkBuffer buffer;
        VmaAllocator allocator = _device->allocator();
        VmaAllocation allocation;
        VmaAllocationInfo allocationInfo;
        vmaCreateBuffer(allocator, &bufferInfo, &allocationCreateInfo, &buffer, &allocation, &allocationInfo);
        _destructionQueue.emplace([allocator, buffer, allocation]()
                                  { vmaDestroyBuffer(allocator, buffer, allocation); });

        memcpy(allocationInfo.pMappedData, src, size);

        return buffer;
    }

    void CommandBufferImpl::copyBufferToTexture(void const *src, const std::shared_ptr<TextureImpl> &texture, uint32_t offset_x, uint32_t offset_y, uint32_t extent_x, uint32_t extent_y)
    {
        VkBuffer buffer = createStagingBuffer(src, FormatInfos.at(texture->info->format).bytes * extent_x * extent_y);

        VkImageSubresourceRange range = {};
        range.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
        range.levelCount = 1;
        range.layerCount = 1;

        VkImageMemoryBarrier imageBarrier_toTransfer = {};
        imageBarrier_toTransfer.sType = VK_STRUCTURE_TYPE_IMAGE_MEMORY_BARRIER;
        imageBarrier_toTransfer.oldLayout = VK_IMAGE_LAYOUT_UNDEFINED;
        imageBarrier_toTransfer.newLayout = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL;
        imageBarrier_toTransfer.image = *texture;
        imageBarrier_toTransfer.subresourceRange = range;
        imageBarrier_toTransfer.srcAccessMask = 0;
        imageBarrier_toTransfer.dstAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
        vkCmdPipelineBarrier(_commandBuffer, VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT, VK_PIPELINE_STAGE_TRANSFER_BIT, 0, 0, nullptr, 0, nullptr, 1, &imageBarrier_toTransfer);

        VkBufferImageCopy copy = {};
        copy.bufferOffset = 0;
        copy.bufferRowLength = 0;
        copy.bufferImageHeight = 0;
        copy.imageSubresource.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
        copy.imageSubresource.mipLevel = 0;
        copy.imageSubresource.baseArrayLayer = 0;
        copy.imageSubresource.layerCount = 1;
        copy.imageOffset.x = offset_x;
        copy.imageOffset.y = offset_y;
        copy.imageExtent.width = extent_x;
        copy.imageExtent.height = extent_y;
        copy.imageExtent.depth = 1;
        vkCmdCopyBufferToImage(_commandBuffer, buffer, *texture, VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL, 1, &copy);

        VkImageMemoryBarrier imageBarrier_toReadable = imageBarrier_toTransfer;
        imageBarrier_toReadable.oldLayout = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL;
        imageBarrier_toReadable.newLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
        imageBarrier_toReadable.srcAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
        imageBarrier_toReadable.dstAccessMask = VK_ACCESS_SHADER_READ_BIT;
        vkCmdPipelineBarrier(_commandBuffer, VK_PIPELINE_STAGE_TRANSFER_BIT, VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT, 0, 0, nullptr, 0, nullptr, 1, &imageBarrier_toReadable);
    }

    void CommandBufferImpl::bindDescriptorSets()
    {
        for (auto &it : _descriptorSets)
        {
            VkDescriptorSet descriptorSet = *it.second->impl;
            uint32_t dynamicOffsetCount = 0;
            uint32_t *pDynamicOffsets = nullptr;
            auto i = _dynamicOffsets.find(it.first);
            if (i != _dynamicOffsets.end())
            {
                dynamicOffsetCount = i->second->size();
                pDynamicOffsets = i->second->data();
            }
            vkCmdBindDescriptorSets(_commandBuffer,
                                    VK_PIPELINE_BIND_POINT_GRAPHICS,
                                    *_pipeline->info->layout->impl,
                                    it.first,
                                    1,
                                    &descriptorSet,
                                    dynamicOffsetCount,
                                    pDynamicOffsets);
        }
        _descriptorSets.clear();
        _dynamicOffsets.clear();
    }

    CommandBufferImpl::~CommandBufferImpl() {}

    CommandBuffer::CommandBuffer(DeviceImpl *device) : impl(std::make_unique<CommandBufferImpl>(device)) {}

    bool CommandBuffer::initialize()
    {
        VkCommandBufferAllocateInfo cmdAllocInfo = {};
        cmdAllocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
        cmdAllocInfo.pNext = nullptr;
        cmdAllocInfo.commandPool = impl->_device->commandPool();
        cmdAllocInfo.commandBufferCount = 1;
        cmdAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;

        vkAllocateCommandBuffers(*impl->_device, &cmdAllocInfo, &impl->_commandBuffer);

        return false;
    }

    void CommandBuffer::begin()
    {
        while (impl->_destructionQueue.size())
        {
            impl->_destructionQueue.front()();
            impl->_destructionQueue.pop();
        }

        VkCommandBufferBeginInfo info = {};
        info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
        info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

        vkBeginCommandBuffer(impl->_commandBuffer, &info);
    }

    void CommandBuffer::copyImageBitmapToTexture(const std::shared_ptr<ImageBitmap> &imageBitmap, const std::shared_ptr<Texture> &texture)
    {
        impl->copyBufferToTexture(imageBitmap->pixels.get(), texture->impl, 0, 0, imageBitmap->width, imageBitmap->height);
    }

    void CommandBuffer::copyBufferToTexture(const std::shared_ptr<const Span> &span, uint32_t offset, const std::shared_ptr<Texture> &texture, uint32_t offset_x, uint32_t offset_y, uint32_t extent_x, uint32_t extent_y)
    {
        impl->copyBufferToTexture(reinterpret_cast<uint8_t *>(span->data) + span->stride * offset, texture->impl, offset_x, offset_y, extent_x, extent_y);
    }

    void CommandBuffer::beginRenderPass(const std::shared_ptr<RenderPass> &renderPass, const std::shared_ptr<Framebuffer> &framebuffer, int32_t x, int32_t y, uint32_t width, uint32_t height)
    {
        VkViewport viewport{};
        viewport.x = x;
        viewport.width = width;
        viewport.minDepth = 0;
        viewport.maxDepth = 1;

        if (framebuffer->impl->isSwapchain())
        {
            // The viewport’s origin in OpenGL is in the lower left of the screen, with Y pointing up.
            // In Vulkan the origin is in the top left of the screen, with Y pointing downwards.
            // https://www.saschawillems.de/blog/2019/03/29/flipping-the-vulkan-viewport/
            y = impl->_device->swapchain()->imageExtent().height - y - height;

            viewport.y = y + height;
            viewport.height = height * -1.0;
        }
        else // https://anki3d.org/vulkan-coordinate-system/
        {
            viewport.y = y;
            viewport.height = height;
        }

        vkCmdSetViewport(impl->_commandBuffer, 0, 1, &viewport);

        VkRect2D scissor = {{x, y}, {width, height}};
        vkCmdSetScissor(impl->_commandBuffer, 0, 1, &scissor);

        VkRenderPassBeginInfo info = {};
        info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
        info.framebuffer = *framebuffer->impl;
        info.renderPass = *renderPass->impl;
        info.renderArea.offset.x = x;
        info.renderArea.offset.y = y;
        info.renderArea.extent = {width, height};

        static std::vector<VkClearValue> clearValues;
        clearValues.resize(0);
        auto colorAttachmentCount = renderPass->info->colors->size();
        for (size_t i = 0; i < colorAttachmentCount; i++)
        {
            VkClearValue clearValue{};
            clearValue.color = {{0.0f, 0.0f, 0.0f, 1.0f}};
            clearValues.emplace_back(clearValue);
        }
        if (renderPass->info->depthStencil)
        {
            VkClearValue clearValue{};
            clearValue.depthStencil.depth = 1;
            clearValues.emplace_back(clearValue);
        }
        info.pClearValues = clearValues.data();
        info.clearValueCount = clearValues.size();

        vkCmdBeginRenderPass(impl->_commandBuffer, &info, VK_SUBPASS_CONTENTS_INLINE);
    }

    void CommandBuffer::bindDescriptorSet(uint32_t index, const std::shared_ptr<DescriptorSet> &descriptorSet, const std::shared_ptr<Uint32Vector> &dynamicOffsets)
    {
        impl->_descriptorSets[index] = descriptorSet;
        if (dynamicOffsets)
        {
            impl->_dynamicOffsets[index] = dynamicOffsets;
        }
    }

    void CommandBuffer::bindInputAssembler(const std::shared_ptr<InputAssembler> &inputAssembler)
    {
        static std::vector<VkBuffer> vertexBuffers;
        static std::vector<VkDeviceSize> vertexOffsets;

        auto &vertexInput = inputAssembler->vertexInput;
        vertexBuffers.resize(vertexInput->buffers->size());
        for (size_t i = 0; i < vertexBuffers.size(); i++)
        {
            vertexBuffers[i] = *vertexInput->buffers->at(i)->impl;
        }
        vertexOffsets.resize(vertexInput->offsets->size());
        for (size_t i = 0; i < vertexOffsets.size(); i++)
        {
            vertexOffsets[i] = vertexInput->offsets->at(i);
        }
        vkCmdBindVertexBuffers(impl->_commandBuffer, 0, vertexBuffers.size(), vertexBuffers.data(), vertexOffsets.data());

        auto &indexInput = inputAssembler->indexInput;
        if (indexInput)
        {
            // WebGL can not specify the offset of the index buffer at buffer binding
            vkCmdBindIndexBuffer(impl->_commandBuffer, *indexInput->buffer->impl, 0, static_cast<VkIndexType>(indexInput->type));
        }
    }

    void CommandBuffer::bindPipeline(const std::shared_ptr<Pipeline> &pipeline)
    {
        vkCmdBindPipeline(impl->_commandBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, *pipeline->impl);
        impl->_pipeline = pipeline;
    }

    void CommandBuffer::draw(uint32_t vertexCount, uint32_t firstVertex, uint32_t instanceCount)
    {
        impl->bindDescriptorSets();
        vkCmdDraw(impl->_commandBuffer, vertexCount, instanceCount, firstVertex, 0);
    }

    void CommandBuffer::drawIndexed(uint32_t indexCount, uint32_t firstIndex, uint32_t instanceCount)
    {
        impl->bindDescriptorSets();
        vkCmdDrawIndexed(impl->_commandBuffer, indexCount, instanceCount, firstIndex, 0, 0);
    }

    void CommandBuffer::endRenderPass()
    {
        vkCmdEndRenderPass(impl->_commandBuffer);
    }

    void CommandBuffer::end()
    {
        vkEndCommandBuffer(impl->_commandBuffer);
    }

    CommandBuffer::~CommandBuffer()
    {
        while (impl->_destructionQueue.size())
        {
            impl->_destructionQueue.front()();
            impl->_destructionQueue.pop();
        }
    }
}
