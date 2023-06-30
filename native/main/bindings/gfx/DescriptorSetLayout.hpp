#pragma once

#include "info.hpp"

namespace binding::gfx
{
    class Device_impl;
    class DescriptorSetLayout_impl;
    class DescriptorSetLayout
    {
    private:
        std::unique_ptr<DescriptorSetLayout_impl> _impl;

        std::shared_ptr<DescriptorSetLayoutInfo> _info;

    public:
        DescriptorSetLayout_impl *impl() { return _impl.get(); }

        const std::shared_ptr<DescriptorSetLayoutInfo> &info() { return _info; }

        DescriptorSetLayout(Device_impl *device);

        bool initialize(std::shared_ptr<DescriptorSetLayoutInfo> info);

        ~DescriptorSetLayout();
    };
}
