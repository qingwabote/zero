#pragma once

#include "VkDevice_impl.hpp"

namespace gfx
{
    class InputAssembler_impl
    {
        friend class InputAssembler;

    public:
        struct VkVertexInput
        {
            std::vector<VkBuffer> vertexBuffers;
            std::vector<VkDeviceSize> vertexOffsets;
        };

        struct VkIndexInput
        {
            VkBuffer indexBuffer{nullptr};
            VkDeviceSize indexOffset{};
            VkIndexType indexType{};
        };

    private:
        Device_impl *_device;

        std::unique_ptr<VkVertexInput> _vertexInput;

        std::unique_ptr<VkIndexInput> _indexInput;

    public:
        InputAssembler_impl(Device_impl *device);

        VkVertexInput *vertexInput() { return _vertexInput.get(); }

        VkIndexInput *indexInput() { return _indexInput.get(); }

        ~InputAssembler_impl();
    };
}
