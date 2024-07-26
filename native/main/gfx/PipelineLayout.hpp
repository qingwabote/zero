#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class PipelineLayout_impl;

    class PipelineLayout
    {
    public:
        const std::unique_ptr<PipelineLayout_impl> impl;

        PipelineLayout(Device_impl *device);

        bool initialize(const std::shared_ptr<PipelineLayoutInfo> &info);

        ~PipelineLayout();
    };

}
