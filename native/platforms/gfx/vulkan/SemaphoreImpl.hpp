#pragma once

#include "DeviceImpl.hpp"

namespace gfx
{
    class SemaphoreImpl
    {
        friend class Semaphore;

    private:
        DeviceImpl *_device = nullptr;

        VkSemaphore _semaphore = nullptr;

    public:
        SemaphoreImpl(DeviceImpl *device);

        operator VkSemaphore() { return _semaphore; }

        ~SemaphoreImpl();
    };

}
