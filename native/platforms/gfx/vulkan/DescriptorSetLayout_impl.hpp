#pragma once

#include "Device_impl.hpp"
#include "internal/DescriptorSetPool.hpp"

namespace gfx
{
    class DescriptorSetLayout_impl
    {
    private:
        Device_impl *_device{nullptr};
        VkDescriptorSetLayout _setLayout{nullptr};

    public:
        const std::shared_ptr<const DescriptorSetLayoutInfo> info;

        const std::unique_ptr<DescriptorSetPool> pool;

        DescriptorSetLayout_impl(Device_impl *device, const std::shared_ptr<const DescriptorSetLayoutInfo> &info);

        bool initialize();

        operator VkDescriptorSetLayout() { return _setLayout; }

        ~DescriptorSetLayout_impl();
    };
}
