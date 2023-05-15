#pragma once

#include "VkDevice_impl.hpp"
#include "internal/VkDescriptorSetPool.hpp"

namespace binding
{
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
            const VkDescriptorSetLayout setLayout() { return _setLayout; }
            DescriptorSetPool &pool() { return *_pool.get(); }

            DescriptorSetLayout_impl(Device_impl *device);
            ~DescriptorSetLayout_impl();
        };
    }
}