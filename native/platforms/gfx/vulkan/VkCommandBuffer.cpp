#include "bindings/gfx/commandbuffer.hpp"
#include "VkCommandBufferImpl.hpp"

namespace binding
{
    namespace gfx
    {
        CommandBufferImpl::CommandBufferImpl(VkCommandBuffer commandBuffer)
        {
        }

        CommandBufferImpl::~CommandBufferImpl()
        {
        }

        CommandBuffer::CommandBuffer(v8::Isolate *isolate, std::unique_ptr<CommandBufferImpl> impl)
            : Binding(isolate), _impl(std::move(impl)) {}

        CommandBuffer::~CommandBuffer()
        {
        }
    }
}
