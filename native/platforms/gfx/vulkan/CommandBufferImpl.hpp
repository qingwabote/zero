#pragma once

#include "DeviceImpl.hpp"
#include "TextureImpl.hpp"
#include <queue>
#include <functional>
#include <unordered_map>

namespace gfx
{
    class DescriptorSet;
    class Pipeline;

    class CommandBufferImpl
    {
        friend class CommandBuffer;

    private:
        VkCommandBuffer _commandBuffer = nullptr;
        DeviceImpl *_device = nullptr;

        std::queue<std::function<void()>> _destructionQueue;

        std::unordered_map<uint32_t, std::shared_ptr<DescriptorSet>> _descriptorSets;
        std::unordered_map<uint32_t, std::shared_ptr<std::vector<uint32_t>>> _dynamicOffsets;

        std::shared_ptr<Pipeline> _pipeline;

        VkBuffer createStagingBuffer(void const *src, size_t size);

        void copyBufferToTexture(void const *src, const std::shared_ptr<TextureImpl> &texture, uint32_t offset_x, uint32_t offset_y, uint32_t extent_x, uint32_t extent_y);

        void bindDescriptorSets();

    public:
        CommandBufferImpl(DeviceImpl *device);

        operator VkCommandBuffer() const { return _commandBuffer; }

        ~CommandBufferImpl();
    };
}
