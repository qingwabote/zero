#pragma once

#include "DeviceImpl.hpp"

namespace gfx
{
    class FenceImpl
    {
        friend class Fence;

    private:
        DeviceImpl *_device = nullptr;

        VkFence _fence = nullptr;

    public:
        FenceImpl(DeviceImpl *device);

        operator VkFence() { return _fence; }

        ~FenceImpl();
    };

}
