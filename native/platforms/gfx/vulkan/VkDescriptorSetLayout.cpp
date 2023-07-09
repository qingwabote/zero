#include "gfx/DescriptorSetLayout.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include <unordered_map>

namespace gfx
{
    DescriptorSetLayout_impl::DescriptorSetLayout_impl(Device_impl *device) : _device(device)
    {
        _pool = std::make_unique<DescriptorSetPool>(*device);
    }

    DescriptorSetLayout_impl::~DescriptorSetLayout_impl() {}

    DescriptorSetLayout::DescriptorSetLayout(Device_impl *device) : _impl(std::make_unique<DescriptorSetLayout_impl>(device)) {}

    bool DescriptorSetLayout::initialize(std::shared_ptr<DescriptorSetLayoutInfo> info)
    {
        uint32_t maxSets{10};

        auto bindingCount = info->bindings->size();
        std::vector<VkDescriptorSetLayoutBinding> setLayoutBindings{bindingCount};
        std::unordered_map<VkDescriptorType, uint32_t> type2count;
        for (uint32_t i = 0; i < bindingCount; i++)
        {
            auto binding = info->bindings->at(i).get();

            setLayoutBindings[i].binding = binding->binding;

            VkDescriptorType descriptorType = static_cast<VkDescriptorType>(binding->descriptorType);
            setLayoutBindings[i].descriptorType = descriptorType;
            setLayoutBindings[i].descriptorCount = binding->descriptorCount;
            setLayoutBindings[i].stageFlags = static_cast<VkShaderStageFlags>(binding->stageFlags);

            type2count[descriptorType] += maxSets * binding->descriptorCount;
        }

        VkDescriptorSetLayoutCreateInfo layoutInfo = {};
        layoutInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
        layoutInfo.pNext = nullptr;
        layoutInfo.bindingCount = bindingCount;
        layoutInfo.pBindings = setLayoutBindings.data();
        layoutInfo.flags = 0;

        if (vkCreateDescriptorSetLayout(*_impl->_device, &layoutInfo, nullptr, &_impl->_setLayout))
        {
            return true;
        }

        std::vector<VkDescriptorPoolSize> descriptorPoolSizes;
        for (auto &it : type2count)
        {
            descriptorPoolSizes.push_back({it.first, it.second});
        }
        _impl->_pool->initialize(descriptorPoolSizes, maxSets, _impl->_setLayout);
        _info = info;

        return false;
    }

    DescriptorSetLayout::~DescriptorSetLayout()
    {
        vkDestroyDescriptorSetLayout(*_impl->_device, _impl->_setLayout, nullptr);
    }
}
