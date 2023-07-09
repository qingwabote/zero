#pragma once

#include "VkDevice_impl.hpp"

namespace gfx
{
    class Queue_impl
    {
        friend class Queue;

    private:
        Device_impl *_device = nullptr;

    public:
        Queue_impl(Device_impl *device);

        operator VkQueue() { return _device->graphicsQueue(); }

        ~Queue_impl();
    };

}
