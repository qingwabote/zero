#pragma once

#include "Device_impl.hpp"

namespace gfx
{
    class PipelineLayout_impl
    {
    private:
        Device_impl *_device{nullptr};
        VkPipelineLayout _layout{nullptr};

    public:
        PipelineLayout_impl(Device_impl *device);

        bool initialize(const PipelineLayoutInfo &info);

        operator VkPipelineLayout() const { return _layout; }

        ~PipelineLayout_impl();
    };
}
