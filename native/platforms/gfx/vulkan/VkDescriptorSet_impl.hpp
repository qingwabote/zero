#pragma once

#include "VkDeviceImpl.hpp"

namespace binding
{
    namespace gfx
    {
        class DescriptorSet_impl
        {
        private:
            DeviceImpl *_device = nullptr;
            VkDescriptorSet _descriptorSet = nullptr;

        public:
            bool initialize(DescriptorSetLayout *layout);

            void bindBuffer(uint32_t binding, Buffer *buffer);

            DescriptorSet_impl(DeviceImpl *device);
            ~DescriptorSet_impl();
        };
    }
}