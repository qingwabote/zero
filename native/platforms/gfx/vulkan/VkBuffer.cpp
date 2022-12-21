#include "bindings/gfx/Buffer.hpp"
#include "VkBuffer_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        Buffer_impl::Buffer_impl(Device_impl *device) : _device(device) {}
        Buffer_impl::~Buffer_impl() {}

        Buffer::Buffer(std::unique_ptr<Buffer_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        bool Buffer::initialize(BufferInfo &info)
        {
            VkBufferCreateInfo bufferInfo = {};
            bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
            bufferInfo.usage = info.usage;
            bufferInfo.size = info.size;

            VmaAllocationCreateInfo allocationCreateInfo = {};
            allocationCreateInfo.usage = static_cast<VmaMemoryUsage>(info.mem_usage);
            if (allocationCreateInfo.usage == VMA_MEMORY_USAGE_CPU_TO_GPU)
            {
                allocationCreateInfo.flags = VMA_ALLOCATION_CREATE_MAPPED_BIT;
            }

            auto res = vmaCreateBuffer(_impl->_device->allocator(), &bufferInfo, &allocationCreateInfo, &_impl->_buffer, &_impl->_allocation, &_impl->_allocationInfo);
            if (res)
            {
                return true;
            }

            return false;
        }

        void Buffer::update(v8::Local<v8::ArrayBufferView> buffer)
        {
            size_t size = sugar::v8::object_get(retrieve("info"), "size").As<v8::Number>()->Value();
            auto start = reinterpret_cast<const uint8_t *>(buffer->Buffer()->Data()) + buffer->ByteOffset();
            memcpy(_impl->_allocationInfo.pMappedData, start, size);
        }

        Buffer::~Buffer()
        {
            VmaAllocator allocator = _impl->_device->allocator();
            VkBuffer buffer = _impl->_buffer;
            VmaAllocation allocation = _impl->_allocation;
            vmaDestroyBuffer(allocator, buffer, allocation);
        }
    }
}
