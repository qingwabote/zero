#include "gfx/Buffer.hpp"
#include "BufferImpl.hpp"
#include "DeviceImpl.hpp"

namespace gfx
{
    BufferImpl::BufferImpl(DeviceImpl *device, const std::shared_ptr<BufferInfo> &info) : _device(device), info(info) {}

    bool BufferImpl::initialize()
    {
        // "size must be greater than 0" https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkBufferCreateInfo.html#VUID-VkBufferCreateInfo-size-00912
        if (info->size)
        {
            VkBufferCreateInfo bufferInfo = {};
            bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
            bufferInfo.usage = static_cast<VkBufferUsageFlags>(info->usage);
            bufferInfo.size = info->size;

            VmaAllocationCreateInfo allocationCreateInfo = {};
            allocationCreateInfo.usage = VMA_MEMORY_USAGE_AUTO_PREFER_DEVICE;
            allocationCreateInfo.flags = VMA_ALLOCATION_CREATE_MAPPED_BIT | VMA_ALLOCATION_CREATE_HOST_ACCESS_SEQUENTIAL_WRITE_BIT;
            if (vmaCreateBuffer(_device->allocator(), &bufferInfo, &allocationCreateInfo, &_buffer, &_allocation, &_allocationInfo))
            {
                return true;
            }
        }

        return false;
    }

    void BufferImpl::update(const void *src, size_t src_length, size_t dst_offset)
    {
        memcpy(reinterpret_cast<uint8_t *>(_allocationInfo.pMappedData) + dst_offset, src, src_length);
    }

    void BufferImpl::resize(uint32_t size)
    {
        if (info->size)
        {
            vmaDestroyBuffer(_device->allocator(), _buffer, _allocation);
        }

        info->size = size;
        initialize();

        emit(BufferImplEvent::RESET);
    }

    BufferImpl::~BufferImpl() { vmaDestroyBuffer(_device->allocator(), _buffer, _allocation); }

    Buffer::Buffer(DeviceImpl *device, const std::shared_ptr<BufferInfo> &info) : impl(std::make_shared<BufferImpl>(device, info)), info(impl->info) {}

    bool Buffer::initialize() { return impl->initialize(); }

    void Buffer::update(const std::shared_ptr<const Span> &src, size_t src_offset, size_t src_length, size_t dst_offset)
    {
        impl->update(reinterpret_cast<uint8_t *>(src->data) + src->stride * src_offset, src->stride * (src_length == 0 ? src->size : src_length), dst_offset);
    }

    void Buffer::resize(uint32_t size)
    {
        impl->resize(size);
    }

    Buffer::~Buffer() {}
}
