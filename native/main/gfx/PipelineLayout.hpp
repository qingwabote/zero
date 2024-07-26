#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class PipelineLayoutImpl;

    class PipelineLayout
    {
    public:
        const std::unique_ptr<PipelineLayoutImpl> impl;

        PipelineLayout(DeviceImpl *device);

        bool initialize(const std::shared_ptr<PipelineLayoutInfo> &info);

        ~PipelineLayout();
    };

}
