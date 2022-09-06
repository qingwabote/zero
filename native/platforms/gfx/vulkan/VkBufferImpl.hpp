#include "vulkan/vulkan.hpp"
#include "vma/vk_mem_alloc.h"
#include "v8.h"

namespace binding
{
    namespace gfx
    {
        class BufferImpl
        {
        private:
            VkDevice _device = nullptr;
            VmaAllocator _allocator = nullptr;

            VkBuffer _buffer = nullptr;
            VmaAllocation _allocation = nullptr;
            VmaAllocationInfo _allocationInfo;

            v8::Global<v8::Object> _info;

        public:
            BufferImpl(VkDevice device, VmaAllocator allocator);

            v8::Local<v8::Object> info();

            bool initialize(v8::Local<v8::Object> info);

            void update(v8::Local<v8::ArrayBufferView> buffer);

            ~BufferImpl();
        };
    }
}
