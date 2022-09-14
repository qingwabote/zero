#include "bindings/gfx/CommandBuffer.hpp"
#include "VkCommandBuffer_impl.hpp"
#include "sugars/v8sugar.hpp"

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
        }

        CommandBuffer::~CommandBuffer() {}
    }
}
