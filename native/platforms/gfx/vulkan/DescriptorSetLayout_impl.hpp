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
        std::unique_ptr<DescriptorSetPool> _pool;

    public:
        const std::shared_ptr<const DescriptorSetLayoutInfo> info;

        DescriptorSetPool &pool() { return *_pool.get(); }

        DescriptorSetLayout_impl(Device_impl *device, const std::shared_ptr<const DescriptorSetLayoutInfo> &info);

        bool initialize();

        operator VkDescriptorSetLayout() { return _setLayout; }

        ~DescriptorSetLayout_impl();
    };
}
