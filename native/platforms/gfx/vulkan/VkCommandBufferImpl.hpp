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
            CommandBufferImpl(VkCommandBuffer commandBuffer);
            ~CommandBufferImpl();
        };
    }
}
