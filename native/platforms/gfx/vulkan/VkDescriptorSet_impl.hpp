#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class DescriptorSet_impl
        {
            friend class DescriptorSet;

        private:
            Device_impl *_device = nullptr;
            VkDescriptorSet _descriptorSet = nullptr;

        public:
            DescriptorSet_impl(Device_impl *device);
            ~DescriptorSet_impl();
        };
    }
}