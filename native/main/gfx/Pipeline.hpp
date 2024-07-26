#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class PipelineImpl;

    class Pipeline
    {
    public:
        const std::unique_ptr<PipelineImpl> impl;

        const std::shared_ptr<PipelineInfo> info;

        Pipeline(DeviceImpl *device, const std::shared_ptr<PipelineInfo> &info);

        bool initialize();

        ~Pipeline();
    };
}
