#pragma once

#include "vulkan/vulkan.hpp"
#include "vma/vk_mem_alloc.h"

namespace binding
{
    namespace gfx
    {
        class Buffer_impl
        {
            friend class Buffer;

        private:
            VkDevice _device = nullptr;
            VmaAllocator _allocator = nullptr;

            VkBuffer _buffer = nullptr;
            VmaAllocation _allocation = nullptr;
            VmaAllocationInfo _allocationInfo;

            v8::Global<v8::Object> _info;

        public:
            Buffer_impl(VkDevice device, VmaAllocator allocator);

            VkBuffer buffer() { return _buffer; }

            ~Buffer_impl();
        };

    }
}
