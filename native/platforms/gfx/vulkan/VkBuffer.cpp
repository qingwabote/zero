#include "bindings/gfx/Buffer.hpp"
#include "VkBufferImpl.hpp"

namespace binding
{
    namespace gfx
    {
        BufferImpl::BufferImpl(VkDevice device, VmaAllocator allocator) : _device(device), _allocator{allocator} {}

        v8::Local<v8::Object> BufferImpl::info()
        {
            return _info.Get(v8::Isolate::GetCurrent());
        }

        bool BufferImpl::initialize(v8::Local<v8::Object> info)
        {
            auto usage = sugar::v8::object_get<v8::Number>(info, "usage");
            VkBufferCreateInfo bufferInfo = {};
            bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
            bufferInfo.usage = usage->Value();
            auto size = sugar::v8::object_get<v8::Number>(info, "size");
            bufferInfo.size = size->Value();

            VmaAllocationCreateInfo allocationCreateInfo = {};
            allocationCreateInfo.usage = VMA_MEMORY_USAGE_CPU_TO_GPU;
            allocationCreateInfo.flags = VMA_ALLOCATION_CREATE_MAPPED_BIT;

            if (vmaCreateBuffer(_allocator, &bufferInfo, &allocationCreateInfo, &_buffer, &_allocation, &_allocationInfo))
            {
                return true;
            }

            _info.Reset(info->GetIsolate(), info);

            return false;
        }

        void BufferImpl::update(v8::Local<v8::ArrayBufferView> buffer)
        {
            auto info = _info.Get(v8::Isolate::GetCurrent());
            auto size = sugar::v8::object_get<v8::Number>(info, "size");
            memcpy(_allocationInfo.pMappedData, buffer->Buffer()->Data(), size->Value());
        }

        BufferImpl::~BufferImpl()
        {
            _info.Reset();
            vmaDestroyBuffer(_allocator, _buffer, _allocation);
        }

        Buffer::Buffer(v8::Isolate *isolate, std::unique_ptr<BufferImpl> impl)
            : Binding(isolate), _impl(std::move(impl)) {}
        v8::Local<v8::Object> Buffer::info() { return _impl->info(); }
        bool Buffer::initialize(v8::Local<v8::Object> info) { return _impl->initialize(info); }
        void Buffer::update(v8::Local<v8::ArrayBufferView> buffer) { return _impl->update(buffer); }
        Buffer::~Buffer() {}
    }
}
