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

        std::shared_ptr<PipelineInfo> _info;

    public:
        Pipeline_impl &impl() { return *_impl.get(); }

        const std::shared_ptr<PipelineInfo> &info() { return _info; }

        Pipeline(Device_impl *device);

        bool initialize(const std::shared_ptr<PipelineInfo> &info);

        ~Pipeline();
    };
}
