#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class DescriptorSetLayoutImpl;
    class DescriptorSetLayout
    {
    public:
        const std::unique_ptr<DescriptorSetLayoutImpl> impl;

        const std::shared_ptr<const DescriptorSetLayoutInfo> &info;

        DescriptorSetLayout(DeviceImpl *device, const std::shared_ptr<DescriptorSetLayoutInfo> &info);

        bool initialize();

        ~DescriptorSetLayout();
    };
}
