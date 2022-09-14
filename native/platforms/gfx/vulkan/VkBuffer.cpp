#include "bindings/gfx/Buffer.hpp"
#include "VkBuffer_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        Buffer_impl::Buffer_impl(VkDevice device, VmaAllocator allocator) : _device(device), _allocator{allocator} {}

        Buffer_impl::~Buffer_impl() {}

        Buffer::Buffer(std::unique_ptr<Buffer_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        v8::Local<v8::Object> Buffer::info()
        {
            return _impl->_info.Get(v8::Isolate::GetCurrent());
        }

        bool Buffer::initialize(v8::Local<v8::Object> info)
        {
            auto usage = sugar::v8::object_get(info, "usage").As<v8::Number>();
            VkBufferCreateInfo bufferInfo = {};
            bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
            bufferInfo.usage = usage->Value();
            auto size = sugar::v8::object_get(info, "size").As<v8::Number>();
            bufferInfo.size = size->Value();

            VmaAllocationCreateInfo allocationCreateInfo = {};
            allocationCreateInfo.usage = VMA_MEMORY_USAGE_CPU_TO_GPU;
            allocationCreateInfo.flags = VMA_ALLOCATION_CREATE_MAPPED_BIT;

            if (vmaCreateBuffer(_impl->_allocator, &bufferInfo, &allocationCreateInfo, &_impl->_buffer, &_impl->_allocation, &_impl->_allocationInfo))
            {
                return true;
            }

            _impl->_info.Reset(info->GetIsolate(), info);

            return false;
        }

        void Buffer::update(v8::Local<v8::ArrayBufferView> buffer)
        {
            auto info = _impl->_info.Get(v8::Isolate::GetCurrent());
            auto size = sugar::v8::object_get(info, "size").As<v8::Number>();
            memcpy(_impl->_allocationInfo.pMappedData, buffer->Buffer()->Data(), size->Value());
        }

        Buffer::~Buffer()
        {
            _impl->_info.Reset();
            vmaDestroyBuffer(_impl->_allocator, _impl->_buffer, _impl->_allocation);
        }
    }
}
