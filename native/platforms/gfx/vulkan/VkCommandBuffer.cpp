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
            info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

            vkBeginCommandBuffer(_impl->_commandBuffer, &info);
        }

        void CommandBuffer::copyBuffer(v8::Local<v8::ArrayBufferView> srcBuffer, Buffer *dstBuffer)
        {
            auto start = reinterpret_cast<const uint8_t *>(srcBuffer->Buffer()->Data()) + srcBuffer->ByteOffset();
            VkBuffer buffer = _impl->createStagingBuffer(start, srcBuffer->ByteLength());

            VkBufferCopy copy = {};
            copy.dstOffset = 0;
            copy.srcOffset = 0;
            copy.size = srcBuffer->ByteLength();
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

        void CommandBuffer::beginRenderPass(RenderPass *c_renderPass, Framebuffer *c_framebuffer, v8::Local<v8::Object> area)
        {
            int32_t x = sugar::v8::object_get(area, "x").As<v8::Number>()->Value();
            int32_t width = sugar::v8::object_get(area, "width").As<v8::Number>()->Value();
            int32_t height = sugar::v8::object_get(area, "height").As<v8::Number>()->Value();
            int32_t y;

            VkViewport viewport;
            viewport.x = x;
            viewport.width = width;
            viewport.minDepth = 0;
            viewport.maxDepth = 1;

            if (c_framebuffer->impl().isSwapchain())
            {
                // The viewport’s origin in OpenGL is in the lower left of the screen, with Y pointing up.
                // In Vulkan the origin is in the top left of the screen, with Y pointing downwards.
                // https://www.saschawillems.de/blog/2019/03/29/flipping-the-vulkan-viewport/
                y = _impl->_device->swapchainImageExtent().height - sugar::v8::object_get(area, "y").As<v8::Number>()->Value() - height;

                viewport.y = y + height;
                viewport.height = -height;

                vkCmdSetFrontFace(_impl->_commandBuffer, VK_FRONT_FACE_COUNTER_CLOCKWISE);
            }
            else
            {
                y = sugar::v8::object_get(area, "y").As<v8::Number>()->Value();

                viewport.y = y;
                viewport.height = height;

                vkCmdSetFrontFace(_impl->_commandBuffer, VK_FRONT_FACE_CLOCKWISE);
            }

            vkCmdSetViewport(_impl->_commandBuffer, 0, 1, &viewport);

            VkRect2D scissor = {{x, y}, {width, height}};
            vkCmdSetScissor(_impl->_commandBuffer, 0, 1, &scissor);

            VkRenderPassBeginInfo info = {};
            info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
            info.framebuffer = c_framebuffer->impl();
            info.renderPass = c_renderPass->impl();
            info.renderArea.offset.x = x;
            info.renderArea.offset.y = y;
            info.renderArea.extent = {uint32_t(width), uint32_t(height)};

            auto js_colorAttachments = sugar::v8::object_get(c_renderPass->info(), "colorAttachments").As<v8::Array>();
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

        void CommandBuffer::bindDescriptorSet(PipelineLayout *pipelineLayout, uint32_t index, DescriptorSet *gfx_descriptorSet, v8::Local<v8::Array> js_dynamicOffsets)
        {
            static std::vector<uint32_t> dynamicOffsets;

            v8::Isolate *isolate = v8::Isolate::GetCurrent();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            dynamicOffsets.resize(js_dynamicOffsets->Length());
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
            // auto time = std::chrono::steady_clock::now();

            static std::vector<VkBuffer> vertexBuffers;
            static std::vector<VkDeviceSize> vertexOffsets;

            v8::Isolate *isolate = v8::Isolate::GetCurrent();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            v8::Local<v8::Object> js_vertexInput = sugar::v8::object_get(inputAssembler, "vertexInput").As<v8::Object>();
            v8::Local<v8::Array> js_vertexBuffers = sugar::v8::object_get(js_vertexInput, "vertexBuffers").As<v8::Array>();
            vertexBuffers.resize(js_vertexBuffers->Length());
            for (uint32_t i = 0; i < js_vertexBuffers->Length(); i++)
            {
                Buffer *c_buffer = Binding::c_obj<Buffer>(js_vertexBuffers->Get(context, i).ToLocalChecked().As<v8::Object>());
                vertexBuffers[i] = c_buffer->impl();
            }

            v8::Local<v8::Array> js_vertexOffsets = sugar::v8::object_get(js_vertexInput, "vertexOffsets").As<v8::Array>();
            vertexOffsets.resize(js_vertexOffsets->Length());
            for (uint32_t i = 0; i < js_vertexOffsets->Length(); i++)
            {
                vertexOffsets[i] = js_vertexOffsets->Get(context, i).ToLocalChecked().As<v8::Number>()->Value();
            }

            // auto dtNS = static_cast<double>(std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::steady_clock::now() - time).count());
            // printf("vertexBuffers %f\n", dtNS * 0.001);

            vkCmdBindVertexBuffers(_impl->_commandBuffer, 0, vertexBuffers.size(), vertexBuffers.data(), vertexOffsets.data());

            v8::Local<v8::Object> js_indexBuffer = sugar::v8::object_get(js_vertexInput, "indexBuffer").As<v8::Object>();
            Buffer *c_buffer = Binding::c_obj<Buffer>(js_indexBuffer);
            uint32_t indexOffset = sugar::v8::object_get(js_vertexInput, "indexOffset").As<v8::Number>()->Value();
            VkIndexType indexType = static_cast<VkIndexType>(sugar::v8::object_get(js_vertexInput, "indexType").As<v8::Number>()->Value());
            vkCmdBindIndexBuffer(_impl->_commandBuffer, c_buffer->impl(), indexOffset, indexType);
        }

        void CommandBuffer::bindPipeline(Pipeline *pipeline)
        {
            vkCmdBindPipeline(_impl->_commandBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->impl());
        }

        void CommandBuffer::draw()
        {
            v8::Local<v8::Object> inputAssembler = retrieve("lastInputAssembler");
            v8::Local<v8::Object> js_vertexInput = sugar::v8::object_get(inputAssembler, "vertexInput").As<v8::Object>();
            uint32_t indexCount = sugar::v8::object_get(js_vertexInput, "indexCount").As<v8::Number>()->Value();
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
