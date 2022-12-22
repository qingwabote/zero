#include "bindings/gfx/CommandBuffer.hpp"
#include "sugars/v8sugar.hpp"

#include "VkCommandBuffer_impl.hpp"
#include "VkPipelineLayout_impl.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "VkPipeline_impl.hpp"
#include "VkTexture_impl.hpp"
#include "VkRenderPass_impl.hpp"
#include "VkFramebuffer_impl.hpp"

// #include <chrono>

namespace binding
{
    namespace gfx
    {
        CommandBuffer_impl::CommandBuffer_impl(Device_impl *device) : _device(device) {}

        VkBuffer CommandBuffer_impl::createStagingBuffer(void const *src, size_t size)
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
            _destructionQueue.push([allocator, buffer, allocation]()
                                   { vmaDestroyBuffer(allocator, buffer, allocation); });

            memcpy(allocationInfo.pMappedData, src, size);

            return buffer;
        }

        CommandBuffer_impl::~CommandBuffer_impl() {}

        CommandBuffer::CommandBuffer(std::unique_ptr<CommandBuffer_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        bool CommandBuffer::initialize()
        {
            VkCommandBufferAllocateInfo cmdAllocInfo = {};
            cmdAllocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
            cmdAllocInfo.pNext = nullptr;
            cmdAllocInfo.commandPool = _impl->_device->commandPool();
            cmdAllocInfo.commandBufferCount = 1;
            cmdAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;

            vkAllocateCommandBuffers(*_impl->_device, &cmdAllocInfo, &_impl->_commandBuffer);

            return false;
        }

        void CommandBuffer::begin()
        {
            while (_impl->_destructionQueue.size())
            {
                _impl->_destructionQueue.front()();
                _impl->_destructionQueue.pop();
            }

            VkCommandBufferBeginInfo info = {};
            info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
            info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

            vkBeginCommandBuffer(_impl->_commandBuffer, &info);
        }

        void CommandBuffer::copyBuffer(const void *src, Buffer *dstBuffer, size_t size)
        {
            VkBuffer buffer = _impl->createStagingBuffer(src, size);

            VkBufferCopy copy = {};
            copy.size = size;
            vkCmdCopyBuffer(_impl->_commandBuffer, buffer, dstBuffer->impl(), 1, &copy);
        }

        void CommandBuffer::copyImageBitmapToTexture(ImageBitmap *imageBitmap, Texture *texture)
        {
            VkDeviceSize size = imageBitmap->width() * imageBitmap->height() * 4;

            VkBuffer buffer = _impl->createStagingBuffer(imageBitmap->pixels(), size);

            VkImageSubresourceRange range = {};
            range.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            range.baseMipLevel = 0;
            range.levelCount = 1;
            range.baseArrayLayer = 0;
            range.layerCount = 1;

            VkImageMemoryBarrier imageBarrier_toTransfer = {};
            imageBarrier_toTransfer.sType = VK_STRUCTURE_TYPE_IMAGE_MEMORY_BARRIER;
            imageBarrier_toTransfer.oldLayout = VK_IMAGE_LAYOUT_UNDEFINED;
            imageBarrier_toTransfer.newLayout = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL;
            imageBarrier_toTransfer.image = texture->impl();
            imageBarrier_toTransfer.subresourceRange = range;
            imageBarrier_toTransfer.srcAccessMask = 0;
            imageBarrier_toTransfer.dstAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
            vkCmdPipelineBarrier(_impl->_commandBuffer, VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT, VK_PIPELINE_STAGE_TRANSFER_BIT, 0, 0, nullptr, 0, nullptr, 1, &imageBarrier_toTransfer);

            VkBufferImageCopy copy = {};
            copy.bufferOffset = 0;
            copy.bufferRowLength = 0;
            copy.bufferImageHeight = 0;
            copy.imageSubresource.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            copy.imageSubresource.mipLevel = 0;
            copy.imageSubresource.baseArrayLayer = 0;
            copy.imageSubresource.layerCount = 1;
            copy.imageExtent.width = imageBitmap->width();
            copy.imageExtent.height = imageBitmap->height();
            copy.imageExtent.depth = 1;
            vkCmdCopyBufferToImage(_impl->_commandBuffer, buffer, texture->impl(), VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL, 1, &copy);

            VkImageMemoryBarrier imageBarrier_toReadable = imageBarrier_toTransfer;
            imageBarrier_toReadable.oldLayout = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL;
            imageBarrier_toReadable.newLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
            imageBarrier_toReadable.srcAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
            imageBarrier_toReadable.dstAccessMask = VK_ACCESS_SHADER_READ_BIT;
            vkCmdPipelineBarrier(_impl->_commandBuffer, VK_PIPELINE_STAGE_TRANSFER_BIT, VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT, 0, 0, nullptr, 0, nullptr, 1, &imageBarrier_toReadable);
        }

        void CommandBuffer::beginRenderPass(RenderPass *renderPass, Framebuffer *framebuffer, RenderArea &area)
        {
            int32_t x = area.x;
            int32_t width = area.width;
            int32_t height = area.height;
            int32_t y;

            VkViewport viewport{};
            viewport.x = x;
            viewport.width = width;
            viewport.minDepth = 0;
            viewport.maxDepth = 1;

            if (framebuffer->impl().isSwapchain())
            {
                // The viewport’s origin in OpenGL is in the lower left of the screen, with Y pointing up.
                // In Vulkan the origin is in the top left of the screen, with Y pointing downwards.
                // https://www.saschawillems.de/blog/2019/03/29/flipping-the-vulkan-viewport/
                y = _impl->_device->swapchainImageExtent().height - area.y - height;

                viewport.y = y + height;
                viewport.height = -height;

                vkCmdSetFrontFace(_impl->_commandBuffer, VK_FRONT_FACE_COUNTER_CLOCKWISE);
            }
            else
            {
                y = area.y;

                viewport.y = y;
                viewport.height = height;

                vkCmdSetFrontFace(_impl->_commandBuffer, VK_FRONT_FACE_CLOCKWISE);
            }

            vkCmdSetViewport(_impl->_commandBuffer, 0, 1, &viewport);

            VkRect2D scissor = {{x, y}, {width, height}};
            vkCmdSetScissor(_impl->_commandBuffer, 0, 1, &scissor);

            VkRenderPassBeginInfo info = {};
            info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
            info.framebuffer = framebuffer->impl();
            info.renderPass = renderPass->impl();
            info.renderArea.offset.x = x;
            info.renderArea.offset.y = y;
            info.renderArea.extent = {uint32_t(width), uint32_t(height)};

            auto js_colorAttachments = sugar::v8::object_get(renderPass->info(), "colorAttachments").As<v8::Array>();
            std::vector<VkClearValue> clearValues(js_colorAttachments->Length() + 1);
            for (int32_t i = 0; i < js_colorAttachments->Length(); i++)
            {
                clearValues[i].color = {{0.0f, 0.0f, 0.0f, 1.0f}};
            }
            clearValues[js_colorAttachments->Length()].depthStencil.depth = 1;
            info.pClearValues = clearValues.data();
            info.clearValueCount = clearValues.size();
            vkCmdBeginRenderPass(_impl->_commandBuffer, &info, VK_SUBPASS_CONTENTS_INLINE);
        }

        void CommandBuffer::bindDescriptorSet(PipelineLayout *pipelineLayout, uint32_t index, DescriptorSet *descriptorSet, std::vector<uint32_t> &dynamicOffsets)
        {
            VkDescriptorSet descriptorSet0 = descriptorSet->impl();
            vkCmdBindDescriptorSets(_impl->_commandBuffer,
                                    VK_PIPELINE_BIND_POINT_GRAPHICS,
                                    pipelineLayout->impl(),
                                    index,
                                    1,
                                    &descriptorSet0,
                                    dynamicOffsets.size(),
                                    dynamicOffsets.data());
        }

        void CommandBuffer::bindInputAssembler(InputAssembler &inputAssembler)
        {
            static std::vector<VkBuffer> vertexBuffers;
            static std::vector<VkDeviceSize> vertexOffsets;

            VertexInput &vertexInput = inputAssembler.vertexInput;

            vertexBuffers.resize(vertexInput.vertexBuffers.size());
            for (uint32_t i = 0; i < vertexBuffers.size(); i++)
            {
                vertexBuffers[i] = vertexInput.vertexBuffers[i]->impl();
            }

            vertexOffsets.resize(vertexInput.vertexOffsets.size());
            for (uint32_t i = 0; i < vertexOffsets.size(); i++)
            {
                vertexOffsets[i] = vertexInput.vertexOffsets[i];
            }

            vkCmdBindVertexBuffers(_impl->_commandBuffer, 0, vertexBuffers.size(), vertexBuffers.data(), vertexOffsets.data());
            vkCmdBindIndexBuffer(_impl->_commandBuffer, vertexInput.indexBuffer->impl(), vertexInput.indexOffset, static_cast<VkIndexType>(vertexInput.indexType));

            _impl->_indexCount = vertexInput.indexCount;
        }

        void CommandBuffer::bindPipeline(Pipeline *pipeline)
        {
            vkCmdBindPipeline(_impl->_commandBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->impl());
        }

        void CommandBuffer::draw()
        {
            vkCmdDrawIndexed(_impl->_commandBuffer, _impl->_indexCount, 1, 0, 0, 0);
        }

        void CommandBuffer::endRenderPass()
        {
            vkCmdEndRenderPass(_impl->_commandBuffer);
        }

        void CommandBuffer::end()
        {
            vkEndCommandBuffer(_impl->_commandBuffer);
        }

        CommandBuffer::~CommandBuffer()
        {
            while (_impl->_destructionQueue.size())
            {
                _impl->_destructionQueue.front()();
                _impl->_destructionQueue.pop();
            }
        }
    }
}
