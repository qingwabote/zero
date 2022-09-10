#include "bindings/gfx/Commandbuffer.hpp"
#include "VkCommandBufferImpl.hpp"

namespace binding
{
    namespace gfx
    {
        void beginRenderPass(v8::Local<v8::Object> area)
        {
        }

        CommandBufferImpl::CommandBufferImpl(VkCommandBuffer commandBuffer)
        {
        }

        CommandBufferImpl::~CommandBufferImpl()
        {
        }

        CommandBuffer::CommandBuffer(std::unique_ptr<CommandBufferImpl> impl)
            : Binding(), _impl(std::move(impl)) {}

        CommandBuffer::~CommandBuffer()
        {
        }
    }
}
