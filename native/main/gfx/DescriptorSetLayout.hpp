#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class DescriptorSetLayout_impl;
    class DescriptorSetLayout
    {
    private:
        std::unique_ptr<DescriptorSetLayout_impl> _impl;

    public:
        DescriptorSetLayout_impl *impl() { return _impl.get(); }

        const std::shared_ptr<const DescriptorSetLayoutInfo> &info;

        DescriptorSetLayout(Device_impl *device, const std::shared_ptr<DescriptorSetLayoutInfo> &info);

        bool initialize();

        ~DescriptorSetLayout();
    };
}
