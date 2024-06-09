#include "gfx/DescriptorSetLayout.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include <unordered_map>

namespace gfx
{
    DescriptorSetLayout_impl::DescriptorSetLayout_impl(Device_impl *device, const std::shared_ptr<const DescriptorSetLayoutInfo> &info) : _device(device), info(info)
    {
        _pool = std::make_unique<DescriptorSetPool>(*device);
    }

    bool DescriptorSetLayout_impl::initialize()
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

        if (vkCreateDescriptorSetLayout(*_device, &layoutInfo, nullptr, &_setLayout))
        {
            return true;
        }

        std::vector<VkDescriptorPoolSize> descriptorPoolSizes;
        for (auto &it : type2count)
        {
            descriptorPoolSizes.push_back({it.first, it.second});
        }
        _pool->initialize(descriptorPoolSizes, maxSets, _setLayout);

        return false;
    }

    DescriptorSetLayout_impl::~DescriptorSetLayout_impl()
    {
        vkDestroyDescriptorSetLayout(*_device, _setLayout, nullptr);
    }

    DescriptorSetLayout::DescriptorSetLayout(Device_impl *device, const std::shared_ptr<DescriptorSetLayoutInfo> &info) : _impl(std::make_unique<DescriptorSetLayout_impl>(device, info)), info(_impl->info) {}

    bool DescriptorSetLayout::initialize() { return _impl->initialize(); }

    DescriptorSetLayout::~DescriptorSetLayout() {}
}
