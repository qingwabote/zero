#pragma once

#include <memory>

namespace gfx
{
    class Device_impl;
    class Fence_impl;

    class Fence
    {
    private:
        std::unique_ptr<Fence_impl> _impl;

    public:
        Fence_impl &impl() { return *_impl.get(); }

        Fence(Device_impl *device);

        bool initialize(bool signaled = false);

        ~Fence();
    };
}
