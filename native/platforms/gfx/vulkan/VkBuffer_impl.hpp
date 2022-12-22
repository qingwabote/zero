#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class Buffer_impl
        {
            friend class Buffer;

        private:
            Device_impl *_device = nullptr;

            VkBuffer _buffer = nullptr;
            VmaAllocation _allocation = nullptr;
            VmaAllocationInfo _allocationInfo{};

        public:
            Buffer_impl(Device_impl *device);

            operator VkBuffer() { return _buffer; }

            ~Buffer_impl();
        };

    }
}
