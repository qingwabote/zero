#include "gfx/Buffer.hpp"
#include "VkBuffer_impl.hpp"
#include "VkDevice_impl.hpp"

namespace gfx
{
    Buffer_impl::Buffer_impl(Device_impl *device) : _device(device) {}

    bool Buffer_impl::initialize(const std::shared_ptr<const BufferInfo> &info)
    {
        // "size must be greater than 0" https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkBufferCreateInfo.html#VUID-VkBufferCreateInfo-size-00912
        if (info->size)
        {
            VkBufferCreateInfo bufferInfo = {};
            bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
            bufferInfo.usage = static_cast<VkBufferUsageFlags>(info->usage);
            bufferInfo.size = info->size;

            VmaAllocationCreateInfo allocationCreateInfo = {};
            allocationCreateInfo.usage = static_cast<VmaMemoryUsage>(info->mem_usage);
            if (allocationCreateInfo.usage == VMA_MEMORY_USAGE_CPU_TO_GPU)
            {
                allocationCreateInfo.flags = VMA_ALLOCATION_CREATE_MAPPED_BIT;
            }

            if (vmaCreateBuffer(_device->allocator(), &bufferInfo, &allocationCreateInfo, &_buffer, &_allocation, &_allocationInfo))
            {
                return true;
            }
        }

        _info = info;

        return false;
    }

    void Buffer_impl::update(const void *data, size_t offset, size_t length)
    {
        auto start = reinterpret_cast<const uint8_t *>(data) + offset;
        memcpy(_allocationInfo.pMappedData, start, length);
    }

    void Buffer_impl::reset(const std::shared_ptr<const BufferInfo> &info)
    {
        if (_info->size)
        {
            vmaDestroyBuffer(_device->allocator(), _buffer, _allocation);
        }
        initialize(info);
        emit(BufferEvent_impl::RESET);
    }

    Buffer_impl::~Buffer_impl() { vmaDestroyBuffer(_device->allocator(), _buffer, _allocation); }

    const std::shared_ptr<const BufferInfo> &Buffer::info() { return _impl->info(); }

    Buffer::Buffer(Device_impl *device) : _impl(std::make_shared<Buffer_impl>(device)) {}

    bool Buffer::initialize(const std::shared_ptr<const BufferInfo> &info) { return _impl->initialize(info); }

    void Buffer::update(const std::shared_ptr<const void> &data, size_t offset, size_t length) { _impl->update(data.get(), offset, length); }

    void Buffer::resize(uint32_t size)
    {
        auto info = std::make_shared<BufferInfo>(*_impl->info());
        info->size = size;
        _impl->reset(info);
    }

    Buffer::~Buffer() {}
}
