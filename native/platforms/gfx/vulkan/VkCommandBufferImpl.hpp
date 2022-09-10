#pragma once

#include "vulkan/vulkan.hpp"

namespace binding
{
    namespace gfx
    {
        class CommandBufferImpl
        {
        private:
            /* data */
        public:
            void beginRenderPass(v8::Local<v8::Object> area);
            CommandBufferImpl(VkCommandBuffer commandBuffer);
            ~CommandBufferImpl();
        };
    }
}
