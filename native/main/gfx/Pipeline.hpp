#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Pipeline_impl;

    class Pipeline
    {
    private:
        std::unique_ptr<Pipeline_impl> _impl;

    public:
        Pipeline_impl &impl() { return *_impl.get(); }

        const std::shared_ptr<PipelineInfo> info;

        Pipeline(Device_impl *device, const std::shared_ptr<PipelineInfo> &info);

        bool initialize();

        ~Pipeline();
    };
}
