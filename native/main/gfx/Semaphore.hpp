#pragma once

#include <memory>

namespace gfx
{
    class Device_impl;
    class Semaphore_impl;

    class Semaphore
    {
    public:
        const std::unique_ptr<Semaphore_impl> impl;

        Semaphore(Device_impl *device);

        bool initialize();

        ~Semaphore();
    };
}
