#pragma once

#include "DeviceImpl.hpp"

namespace gfx
{
    class PipelineImpl
    {
        friend class Pipeline;

    private:
        DeviceImpl *_device = nullptr;
        VkPipeline _pipeline = nullptr;

    public:
        PipelineImpl(DeviceImpl *device);

        operator VkPipeline() const { return _pipeline; }

        ~PipelineImpl();
    };
}
