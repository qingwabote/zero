#pragma once

#include "DeviceImpl.hpp"
#include "internal/DescriptorSetPool.hpp"

namespace gfx
{
    class DescriptorSetLayoutImpl
    {
    private:
        DeviceImpl *_device{nullptr};
        VkDescriptorSetLayout _setLayout{nullptr};

    public:
        const std::shared_ptr<const DescriptorSetLayoutInfo> info;

        const std::unique_ptr<DescriptorSetPool> pool;

        DescriptorSetLayoutImpl(DeviceImpl *device, const std::shared_ptr<const DescriptorSetLayoutInfo> &info);

        bool initialize();

        operator VkDescriptorSetLayout() { return _setLayout; }

        ~DescriptorSetLayoutImpl();
    };
}
