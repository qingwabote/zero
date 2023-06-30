#pragma once

#include "VkDevice_impl.hpp"
#include <queue>
#include <functional>

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

            std::queue<std::function<void()>> _destructionQueue;

            VkBuffer createStagingBuffer(void const *src, size_t size);

        public:
            CommandBuffer_impl(Device_impl *device);

            operator VkCommandBuffer() const { return _commandBuffer; }

            ~CommandBuffer_impl();
        };
    }
}
