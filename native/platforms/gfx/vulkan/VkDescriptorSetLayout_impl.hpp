#pragma once

#include "VkDeviceImpl.hpp"

namespace binding
{
    namespace gfx
    {
        class DescriptorSetLayout_impl
        {
        private:
            DeviceImpl *_device = nullptr;
            VkDescriptorSetLayout _setLayout = nullptr;

        public:
            const VkDescriptorSetLayout setLayout() { return _setLayout; }

            DescriptorSetLayout_impl(DeviceImpl *device);

            bool initialize(v8::Local<v8::Array> js_setLayoutBindings);

            ~DescriptorSetLayout_impl();
        };
    }
}