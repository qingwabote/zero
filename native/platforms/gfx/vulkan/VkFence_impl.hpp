#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class Fence_impl
        {
            friend class Fence;

        private:
            Device_impl *_device = nullptr;

            VkFence _fence = nullptr;

        public:
            Fence_impl(Device_impl *device);

            operator VkFence() { return _fence; }

            ~Fence_impl();
        };

    }
}
