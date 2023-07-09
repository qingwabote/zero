#pragma once

#include <memory>

namespace gfx
{
    class Device_impl;
    class Semaphore_impl;

    class Semaphore
    {
    private:
        std::unique_ptr<Semaphore_impl> _impl;

    public:
        Semaphore_impl &impl() { return *_impl.get(); }

        Semaphore(Device_impl *device);

        bool initialize();

        ~Semaphore();
    };
}
