#pragma once

#include "VkDevice_impl.hpp"
#include "internal/VkDescriptorSetPool.hpp"

namespace gfx
{
    class DescriptorSetLayout_impl
    {
    private:
        Device_impl *_device{nullptr};
        VkDescriptorSetLayout _setLayout{nullptr};
        std::unique_ptr<DescriptorSetPool> _pool;

        std::shared_ptr<const DescriptorSetLayoutInfo> _info;

    public:
        const std::shared_ptr<const DescriptorSetLayoutInfo> &info() { return _info; };

        DescriptorSetPool &pool() { return *_pool.get(); }

        DescriptorSetLayout_impl(Device_impl *device);

        bool initialize(const std::shared_ptr<const DescriptorSetLayoutInfo> &info);

        operator VkDescriptorSetLayout() { return _setLayout; }

        ~DescriptorSetLayout_impl();
    };
}
