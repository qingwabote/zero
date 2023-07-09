#pragma once

#include "VkDevice_impl.hpp"
#include "VkDescriptorSetLayout_impl.hpp"

namespace gfx
{
    class DescriptorSet_impl
    {
        friend class DescriptorSet;

    private:
        Device_impl *_device{nullptr};
        VkDescriptorSet _descriptorSet{nullptr};

        DescriptorSetLayout_impl *_layout{nullptr};

    public:
        DescriptorSet_impl(Device_impl *device);

        operator VkDescriptorSet() const { return _descriptorSet; }

        ~DescriptorSet_impl();
    };
}
