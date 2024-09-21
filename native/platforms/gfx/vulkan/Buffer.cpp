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

    void BufferImpl::update(const void *data, size_t offset, size_t length)
    {
        auto start = reinterpret_cast<const uint8_t *>(data) + offset;
        memcpy(_allocationInfo.pMappedData, start, length);
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

    void Buffer::update(const std::shared_ptr<const void> &data, size_t offset, size_t length) { impl->update(data.get(), offset, length); }

    void Buffer::resize(uint32_t size)
    {
        impl->resize(size);
    }

    Buffer::~Buffer() {}
}
