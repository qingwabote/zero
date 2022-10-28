#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class DescriptorSetLayout_impl
        {
            friend class DescriptorSetLayout;

        private:
            Device_impl *_device = nullptr;
            VkDescriptorSetLayout _setLayout = nullptr;

        public:
            const VkDescriptorSetLayout setLayout() { return _setLayout; }

            DescriptorSetLayout_impl(Device_impl *device);

            ~DescriptorSetLayout_impl();
        };
    }
}