#pragma once

#include <memory>

namespace gfx
{
    class DeviceImpl;
    class SemaphoreImpl;

    class Semaphore
    {
    public:
        const std::unique_ptr<SemaphoreImpl> impl;

        Semaphore(DeviceImpl *device);

        bool initialize();

        ~Semaphore();
    };
}
