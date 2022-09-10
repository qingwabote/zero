#include "bindings/gfx/Commandbuffer.hpp"
#include "VkCommandBufferImpl.hpp"

namespace binding
{
    namespace gfx
    {
        void CommandBufferImpl::begin()
        {
            VkCommandBufferBeginInfo info = {};
            info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
            info.pNext = nullptr;
            info.pInheritanceInfo = nullptr;
            info.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;

            vkBeginCommandBuffer(_commandBuffer, &info);
        }

        void CommandBufferImpl::beginRenderPass(v8::Local<v8::Object> area)
        {
        }

        CommandBufferImpl::CommandBufferImpl(DeviceImpl *device)
        {
            VkCommandBufferAllocateInfo cmdAllocInfo = {};
            cmdAllocInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
            cmdAllocInfo.pNext = nullptr;
            cmdAllocInfo.commandPool = device->commandPool();
            cmdAllocInfo.commandBufferCount = 1;
            cmdAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;

            vkAllocateCommandBuffers(device->device(), &cmdAllocInfo, &_commandBuffer);
        }

        CommandBufferImpl::~CommandBufferImpl() {}

        CommandBuffer::CommandBuffer(std::unique_ptr<CommandBufferImpl> impl)
            : Binding(), _impl(std::move(impl)) {}

        void CommandBuffer::begin() { _impl->begin(); }

        CommandBuffer::~CommandBuffer()
        {
        }
    }
}
