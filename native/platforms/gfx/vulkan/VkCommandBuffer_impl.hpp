#pragma once

#include "VkDevice_impl.hpp"
#include <queue>
#include <functional>
#include <unordered_map>

namespace gfx
{
    class DescriptorSet;
    class Pipeline;

    class CommandBuffer_impl
    {
        friend class CommandBuffer;

    private:
        VkCommandBuffer _commandBuffer = nullptr;
        Device_impl *_device = nullptr;

        std::queue<std::function<void()>> _destructionQueue;

        VkBuffer createStagingBuffer(void const *src, size_t size);

        std::unordered_map<uint32_t, std::shared_ptr<DescriptorSet>> _descriptorSets;
        std::unordered_map<uint32_t, std::shared_ptr<std::vector<uint32_t>>> _dynamicOffsets;

        std::shared_ptr<Pipeline> _pipeline;

        void bindDescriptorSets();

    public:
        CommandBuffer_impl(Device_impl *device);

        operator VkCommandBuffer() const { return _commandBuffer; }

        ~CommandBuffer_impl();
    };
}
