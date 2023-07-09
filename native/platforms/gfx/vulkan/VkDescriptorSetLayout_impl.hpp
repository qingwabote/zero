#pragma once

#include "VkDevice_impl.hpp"
#include "internal/VkDescriptorSetPool.hpp"

namespace gfx
{
    class DescriptorSetLayout_impl
    {
        friend class DescriptorSetLayout;

    private:
        Device_impl *_device{nullptr};
        VkDescriptorSetLayout _setLayout{nullptr};
        std::unique_ptr<DescriptorSetPool> _pool;

    public:
        DescriptorSetPool &pool() { return *_pool.get(); }

        DescriptorSetLayout_impl(Device_impl *device);

        operator VkDescriptorSetLayout() { return _setLayout; }

        ~DescriptorSetLayout_impl();
    };
}
