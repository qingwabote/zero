#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class DescriptorSetLayout_impl;
    class DescriptorSetLayout
    {
    public:
        const std::unique_ptr<DescriptorSetLayout_impl> impl;

        const std::shared_ptr<const DescriptorSetLayoutInfo> &info;

        DescriptorSetLayout(Device_impl *device, const std::shared_ptr<DescriptorSetLayoutInfo> &info);

        bool initialize();

        ~DescriptorSetLayout();
    };
}
