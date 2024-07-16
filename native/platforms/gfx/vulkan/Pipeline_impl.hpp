#pragma once

#include "Device_impl.hpp"

namespace gfx
{
    class Pipeline_impl
    {
        friend class Pipeline;

    private:
        Device_impl *_device = nullptr;
        VkPipeline _pipeline = nullptr;

    public:
        Pipeline_impl(Device_impl *device);

        operator VkPipeline() const { return _pipeline; }

        ~Pipeline_impl();
    };
}
