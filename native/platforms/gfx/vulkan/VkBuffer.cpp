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

        v8::Local<v8::Object> Buffer::info()
        {
            return retrieve("info");
        }

        bool Buffer::initialize(v8::Local<v8::Object> info)
        {
            retain(info, "info");

            auto usage = sugar::v8::object_get(info, "usage").As<v8::Number>();
            VkBufferCreateInfo bufferInfo = {};
            bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
            bufferInfo.usage = usage->Value();
            auto size = sugar::v8::object_get(info, "size").As<v8::Number>();
            bufferInfo.size = size->Value();

            VmaAllocationCreateInfo allocationCreateInfo = {};
            allocationCreateInfo.usage = VMA_MEMORY_USAGE_CPU_TO_GPU;
            allocationCreateInfo.flags = VMA_ALLOCATION_CREATE_MAPPED_BIT;

            if (vmaCreateBuffer(_impl->_device->allocator(), &bufferInfo, &allocationCreateInfo, &_impl->_buffer, &_impl->_allocation, &_impl->_allocationInfo))
            {
                return true;
            }

            return false;
        }

        void Buffer::update(v8::Local<v8::ArrayBufferView> buffer)
        {
            auto size = sugar::v8::object_get(info(), "size").As<v8::Number>();
            memcpy(_impl->_allocationInfo.pMappedData, buffer->Buffer()->Data(), size->Value());
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
