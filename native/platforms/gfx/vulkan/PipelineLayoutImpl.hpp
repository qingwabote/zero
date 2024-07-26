#pragma once

#include "DeviceImpl.hpp"

namespace gfx
{
    class PipelineLayoutImpl
    {
    private:
        DeviceImpl *_device{nullptr};
        VkPipelineLayout _layout{nullptr};

    public:
        PipelineLayoutImpl(DeviceImpl *device);

        bool initialize(const PipelineLayoutInfo &info);

        operator VkPipelineLayout() const { return _layout; }

        ~PipelineLayoutImpl();
    };
}
