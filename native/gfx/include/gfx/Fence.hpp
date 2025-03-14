#pragma once

#include <memory>

namespace gfx
{
    class DeviceImpl;
    class FenceImpl;

    class Fence
    {
    public:
        const std::unique_ptr<FenceImpl> impl;

        Fence(DeviceImpl *device);

        bool initialize(bool signaled = false);

        ~Fence();
    };
}
