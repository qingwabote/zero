#pragma once

#include "Device_impl.hpp"

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
