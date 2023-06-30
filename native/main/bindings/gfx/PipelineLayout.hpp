#pragma once

#include "info.hpp"

namespace binding
{
    namespace gfx
    {
        class Device_impl;
        class PipelineLayout_impl;

        class PipelineLayout
        {
        private:
            std::unique_ptr<PipelineLayout_impl> _impl;

        public:
            PipelineLayout_impl &impl() { return *_impl.get(); }

            PipelineLayout(Device_impl *device);

            bool initialize(const std::shared_ptr<PipelineLayoutInfo> &info);

            ~PipelineLayout();
        };

    }
}