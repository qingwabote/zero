#pragma once

#include "VkDevice_impl.hpp"

struct VertexInput
{
    std::vector<VkBuffer> vertexBuffers;
    std::vector<VkDeviceSize> vertexOffsets;
    VkBuffer indexBuffer{nullptr};
    VkIndexType indexType{};
    uint32_t indexCount{};
    VkDeviceSize indexOffset{};
};

namespace binding::gfx
{
    class InputAssembler_impl
    {
        friend class InputAssembler;

    private:
        Device_impl *_device;

        VertexInput _vertexInput;

    public:
        InputAssembler_impl(Device_impl *device);

        VertexInput &vertexInput() { return _vertexInput; }

        ~InputAssembler_impl();
    };

}
