#include "bindings/gfx/CommandBuffer.hpp"
#include "sugars/v8sugar.hpp"

#include "VkCommandBuffer_impl.hpp"
#include "VkPipelineLayout_impl.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "VkPipeline_impl.hpp"
#include "VkTexture_impl.hpp"
#include "VkRenderPass_impl.hpp"

namespace binding
{
    namespace gfx
    {
        CommandBuffer_impl::CommandBuffer_impl(Device_impl *device) : _device(device) {}

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

            vkAllocateCommandBuffers(_impl->_device->device(), &cmdAllocInfo, &_impl->_commandBuffer);

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
            info.pNext = nullptr;
            info.pInheritanceInfo = nullptr;
            info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

            vkBeginCommandBuffer(_impl->_commandBuffer, &info);
        }

        void CommandBuffer::copyImageBitmapToTexture(ImageBitmap *imageBitmap, Texture *texture)
        {
            VkDeviceSize size = imageBitmap->width() * imageBitmap->height() * 4;

            VkBufferCreateInfo bufferInfo = {};
            bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
            bufferInfo.size = size;
            bufferInfo.usage = VK_BUFFER_USAGE_TRANSFER_SRC_BIT;

            VmaAllocationCreateInfo allocationCreateInfo = {};
            allocationCreateInfo.usage = VMA_MEMORY_USAGE_CPU_ONLY;
            allocationCreateInfo.flags = VMA_ALLOCATION_CREATE_MAPPED_BIT;

            VkBuffer buffer;
            VmaAllocator allocator = _impl->_device->allocator();
            VmaAllocation allocation;
            VmaAllocationInfo allocationInfo;
            vmaCreateBuffer(allocator, &bufferInfo, &allocationCreateInfo, &buffer, &allocation, &allocationInfo);
            _impl->_destructionQueue.push([allocator, buffer, allocation]()
                                          { vmaDestroyBuffer(allocator, buffer, allocation); });

            memcpy(allocationInfo.pMappedData, imageBitmap->pixels(), size);

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

            VkBufferImageCopy copyRegion = {};
            copyRegion.bufferOffset = 0;
            copyRegion.bufferRowLength = 0;
            copyRegion.bufferImageHeight = 0;
            copyRegion.imageSubresource.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            copyRegion.imageSubresource.mipLevel = 0;
            copyRegion.imageSubresource.baseArrayLayer = 0;
            copyRegion.imageSubresource.layerCount = 1;
            copyRegion.imageExtent.width = imageBitmap->width();
            copyRegion.imageExtent.height = imageBitmap->height();
            copyRegion.imageExtent.depth = 1;
            vkCmdCopyBufferToImage(_impl->_commandBuffer, buffer, texture->impl(), VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL, 1, &copyRegion);

            VkImageMemoryBarrier imageBarrier_toReadable = imageBarrier_toTransfer;
            imageBarrier_toReadable.oldLayout = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL;
            imageBarrier_toReadable.newLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
            imageBarrier_toReadable.srcAccessMask = VK_ACCESS_TRANSFER_WRITE_BIT;
            imageBarrier_toReadable.dstAccessMask = VK_ACCESS_SHADER_READ_BIT;
            vkCmdPipelineBarrier(_impl->_commandBuffer, VK_PIPELINE_STAGE_TRANSFER_BIT, VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT, 0, 0, nullptr, 0, nullptr, 1, &imageBarrier_toReadable);
        }

        void CommandBuffer::beginRenderPass(RenderPass *c_renderPass, v8::Local<v8::Object> area)
        {
            const int32_t x = sugar::v8::object_get(area, "x").As<v8::Number>()->Value();
            const int32_t y = sugar::v8::object_get(area, "y").As<v8::Number>()->Value();
            const uint32_t width = sugar::v8::object_get(area, "width").As<v8::Number>()->Value();
            const uint32_t height = sugar::v8::object_get(area, "height").As<v8::Number>()->Value();

            VkRenderPassBeginInfo info = {};
            info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
            info.pNext = nullptr;
            info.renderPass = c_renderPass->impl();
            info.renderArea.offset.x = x;
            info.renderArea.offset.y = y;
            info.renderArea.extent = {width, height};

            VkClearValue clearValue = {};
            clearValue.color = {{0.0f, 0.0f, 0.0f, 1.0f}};
            VkClearValue depthClear = {};
            depthClear.depthStencil.depth = 1.f;
            VkClearValue clearValues[] = {clearValue, depthClear};
            info.pClearValues = clearValues;
            info.clearValueCount = 2;

            info.framebuffer = _impl->_device->curFramebuffer();

            vkCmdBeginRenderPass(_impl->_commandBuffer, &info, VK_SUBPASS_CONTENTS_INLINE);

            VkViewport viewport{x, y, width, height, 0, 1};
            // The viewport’s origin in OpenGL is in the lower left of the screen, with Y pointing up.
            // In Vulkan the origin is in the top left of the screen, with Y pointing downwards.
            // https://www.saschawillems.de/blog/2019/03/29/flipping-the-vulkan-viewport/
            viewport.y = y + height;
            viewport.height = -viewport.height;
            //
            vkCmdSetViewport(_impl->_commandBuffer, 0, 1, &viewport);

            VkRect2D scissor = {{x, y}, {width, height}};
            vkCmdSetScissor(_impl->_commandBuffer, 0, 1, &scissor);
        }

        void CommandBuffer::bindDescriptorSet(PipelineLayout *pipelineLayout, uint32_t index, DescriptorSet *gfx_descriptorSet, v8::Local<v8::Array> js_dynamicOffsets)
        {
            v8::Isolate *isolate = v8::Isolate::GetCurrent();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            std::vector<uint32_t> dynamicOffsets(js_dynamicOffsets->Length());
            for (uint32_t i = 0; i < js_dynamicOffsets->Length(); i++)
            {
                dynamicOffsets[i] = js_dynamicOffsets->Get(context, i).ToLocalChecked().As<v8::Number>()->Value();
            }

            VkDescriptorSet descriptorSet = gfx_descriptorSet->impl();
            vkCmdBindDescriptorSets(_impl->_commandBuffer,
                                    VK_PIPELINE_BIND_POINT_GRAPHICS,
                                    pipelineLayout->impl(),
                                    index,
                                    1,
                                    &descriptorSet,
                                    dynamicOffsets.size(),
                                    dynamicOffsets.data());
        }

        void CommandBuffer::bindInputAssembler(v8::Local<v8::Object> inputAssembler)
        {
            v8::Isolate *isolate = v8::Isolate::GetCurrent();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            v8::Local<v8::Array> js_vertexBuffers = sugar::v8::object_get(inputAssembler, "vertexBuffers").As<v8::Array>();
            std::vector<VkBuffer> vertexBuffers(js_vertexBuffers->Length());
            for (uint32_t i = 0; i < js_vertexBuffers->Length(); i++)
            {
                Buffer *c_buffer = Binding::c_obj<Buffer>(js_vertexBuffers->Get(context, i).ToLocalChecked().As<v8::Object>());
                vertexBuffers[i] = c_buffer->impl();
            }

            v8::Local<v8::Array> js_vertexOffsets = sugar::v8::object_get(inputAssembler, "vertexOffsets").As<v8::Array>();
            std::vector<VkDeviceSize> vertexOffsets(js_vertexOffsets->Length());
            for (uint32_t i = 0; i < js_vertexOffsets->Length(); i++)
            {
                vertexOffsets[i] = js_vertexOffsets->Get(context, i).ToLocalChecked().As<v8::Number>()->Value();
            }

            vkCmdBindVertexBuffers(_impl->_commandBuffer, 0, vertexBuffers.size(), vertexBuffers.data(), vertexOffsets.data());

            v8::Local<v8::Object> js_indexBuffer = sugar::v8::object_get(inputAssembler, "indexBuffer").As<v8::Object>();
            Buffer *c_buffer = Binding::c_obj<Buffer>(js_indexBuffer);
            uint32_t indexOffset = sugar::v8::object_get(inputAssembler, "indexOffset").As<v8::Number>()->Value();
            VkIndexType indexType = static_cast<VkIndexType>(sugar::v8::object_get(inputAssembler, "indexType").As<v8::Number>()->Value());
            vkCmdBindIndexBuffer(_impl->_commandBuffer, c_buffer->impl(), indexOffset, indexType);
        }

        void CommandBuffer::bindPipeline(Pipeline *pipeline)
        {
            vkCmdBindPipeline(_impl->_commandBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->impl());
        }

        void CommandBuffer::draw()
        {
            v8::Local<v8::Object> inputAssembler = retrieve("lastInputAssembler");
            uint32_t indexCount = sugar::v8::object_get(inputAssembler, "indexCount").As<v8::Number>()->Value();
            vkCmdDrawIndexed(_impl->_commandBuffer, indexCount, 1, 0, 0, 0);
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
