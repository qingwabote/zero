#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class CommandBuffer_impl
        {
            friend class CommandBuffer;

        private:
            VkCommandBuffer _commandBuffer = nullptr;
            Device_impl *_device = nullptr;

        public:
            CommandBuffer_impl(Device_impl *device);
            ~CommandBuffer_impl();
        };
    }
}
