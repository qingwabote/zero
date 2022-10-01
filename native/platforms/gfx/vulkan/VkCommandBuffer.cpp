#include "bindings/gfx/CommandBuffer.hpp"
#include "sugars/v8sugar.hpp"

#include "VkCommandBuffer_impl.hpp"
#include "VkPipelineLayout_impl.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "VkPipeline_impl.hpp"

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

            VkCommandBufferBeginInfo info = {};
            info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
            info.pNext = nullptr;
            info.pInheritanceInfo = nullptr;
            info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

            vkBeginCommandBuffer(_impl->_commandBuffer, &info);
        }

        void CommandBuffer::beginRenderPass(v8::Local<v8::Object> area)
        {
            const int32_t x = sugar::v8::object_get(area, "x").As<v8::Number>()->Value();
            const int32_t y = sugar::v8::object_get(area, "y").As<v8::Number>()->Value();
            const uint32_t width = sugar::v8::object_get(area, "width").As<v8::Number>()->Value();
            const uint32_t height = sugar::v8::object_get(area, "height").As<v8::Number>()->Value();

            VkClearValue clearValue = {};
            clearValue.color = {{0.0f, 0.0f, 0.0f, 1.0f}};

            VkRenderPassBeginInfo info = {};
            info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
            info.pNext = nullptr;
            info.renderPass = _impl->_device->renderPass();
            info.renderArea.offset.x = x;
            info.renderArea.offset.y = y;
            info.renderArea.extent = {width, height};
            info.clearValueCount = 1;
            info.pClearValues = &clearValue;
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
            std::vector<VkBuffer> vertexBuffers{js_vertexBuffers->Length()};
            for (uint32_t i = 0; i < js_vertexBuffers->Length(); i++)
            {
                Buffer *c_buffer = Binding::c_obj<Buffer>(js_vertexBuffers->Get(context, i).ToLocalChecked().As<v8::Object>());
                vertexBuffers[i] = c_buffer->impl();
            }
            std::vector<VkDeviceSize> offsets(js_vertexBuffers->Length(), 0);
            vkCmdBindVertexBuffers(_impl->_commandBuffer, 0, vertexBuffers.size(), vertexBuffers.data(), offsets.data());

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
            v8::Local<v8::Object> inputAssembler = retrieve("inputAssembler");
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

        CommandBuffer::~CommandBuffer() {}
    }
}
