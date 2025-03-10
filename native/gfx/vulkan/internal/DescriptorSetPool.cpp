#include "DescriptorSetPool.hpp"

DescriptorSetPool::DescriptorSetPool(VkDevice device) : _device(device) {}

void DescriptorSetPool::initialize(std::vector<VkDescriptorPoolSize> &poolSizes, uint32_t maxSets, VkDescriptorSetLayout layout)
{
    _poolSizes = poolSizes;
    _maxSets = maxSets;
    _layout = layout;
}

VkDescriptorSet DescriptorSetPool::get()
{
    VkDescriptorSet set = _sets.back();
    _sets.pop_back();
    return set;
}

void DescriptorSetPool::put(VkDescriptorSet set)
{
    _sets.emplace_back(set);
}

void DescriptorSetPool::multiply()
{
    VkDescriptorPoolCreateInfo poolInfo{};
    poolInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_POOL_CREATE_INFO;
    poolInfo.maxSets = _maxSets;
    poolInfo.poolSizeCount = _poolSizes.size();
    poolInfo.pPoolSizes = _poolSizes.data();
    VkDescriptorPool descriptorPool{nullptr};
    vkCreateDescriptorPool(_device, &poolInfo, nullptr, &descriptorPool);
    _pools.push_back(descriptorPool);

    std::vector<VkDescriptorSet> sets(_maxSets, nullptr);
    std::vector<VkDescriptorSetLayout> layouts(_maxSets, _layout);
    VkDescriptorSetAllocateInfo info{VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO};
    info.pSetLayouts = layouts.data();
    info.descriptorSetCount = _maxSets;
    info.descriptorPool = descriptorPool;
    vkAllocateDescriptorSets(_device, &info, sets.data());

    _sets.insert(_sets.end(), sets.begin(), sets.end());
}

DescriptorSetPool::~DescriptorSetPool()
{
    for (auto &pool : _pools)
    {
        vkDestroyDescriptorPool(_device, pool, nullptr);
    }
}