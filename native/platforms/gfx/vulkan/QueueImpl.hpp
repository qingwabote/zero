#pragma once

#include "DeviceImpl.hpp"

namespace gfx
{
    class QueueImpl
    {
        friend class Queue;

    private:
        DeviceImpl *_device = nullptr;

    public:
        QueueImpl(DeviceImpl *device);

        operator VkQueue() { return _device->graphicsQueue(); }

        ~QueueImpl();
    };

}
