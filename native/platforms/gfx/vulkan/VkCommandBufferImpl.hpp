// #include "CommandBuffer.hpp"
#include "VkBootstrap.h"

namespace binding
{
    namespace gfx
    {
        class CommandBufferImpl
        {
        private:
            /* data */
        public:
            CommandBufferImpl(VkCommandBuffer commandBuffer);
            ~CommandBufferImpl();
        };
    }
}
