#pragma once

#include "volk/volk.h"
#include <vector>

class DescriptorSetPool
{
private:
    VkDevice _device{nullptr};

    std::vector<VkDescriptorPoolSize> _poolSizes;
    uint32_t _maxSets{0};

    VkDescriptorSetLayout _layout{nullptr};

    std::vector<VkDescriptorPool> _pools;

    std::vector<VkDescriptorSet> _sets;

    void multiply();

public:
    DescriptorSetPool(VkDevice device);

    void initialize(std::vector<VkDescriptorPoolSize> &poolSizes, uint32_t maxSets, VkDescriptorSetLayout layout);

    VkDescriptorSet get();

    void put(VkDescriptorSet set);

    ~DescriptorSetPool();
};