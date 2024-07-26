#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Pipeline_impl;

    class Pipeline
    {
    public:
        const std::unique_ptr<Pipeline_impl> impl;

        const std::shared_ptr<PipelineInfo> info;

        Pipeline(Device_impl *device, const std::shared_ptr<PipelineInfo> &info);

        bool initialize();

        ~Pipeline();
    };
}
