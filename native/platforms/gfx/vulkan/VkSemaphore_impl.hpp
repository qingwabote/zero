#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class Semaphore_impl
        {
            friend class Semaphore;

        private:
            Device_impl *_device = nullptr;

            VkSemaphore _semaphore = nullptr;

        public:
            Semaphore_impl(Device_impl *device);

            operator VkSemaphore() { return _semaphore; }

            ~Semaphore_impl();
        };

    }
}