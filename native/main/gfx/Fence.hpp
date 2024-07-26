#pragma once

#include <memory>

namespace gfx
{
    class Device_impl;
    class Fence_impl;

    class Fence
    {
    public:
        const std::unique_ptr<Fence_impl> impl;

        Fence(Device_impl *device);

        bool initialize(bool signaled = false);

        ~Fence();
    };
}
