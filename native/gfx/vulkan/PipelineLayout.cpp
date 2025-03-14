#include "gfx/PipelineLayout.hpp"
#include "PipelineLayoutImpl.hpp"

#include "gfx/DescriptorSetLayout.hpp"
#include "DescriptorSetLayoutImpl.hpp"

namespace gfx
{
    PipelineLayoutImpl::PipelineLayoutImpl(DeviceImpl *device) : _device(device) {}

    bool PipelineLayoutImpl::initialize(const PipelineLayoutInfo &info)
    {
        std::vector<VkDescriptorSetLayout> descriptorSetLayouts(info.layouts->size());
        for (uint32_t i = 0; i < descriptorSetLayouts.size(); ++i)
        {

            descriptorSetLayouts[i] = *info.layouts->at(i)->impl;
        }

        VkPipelineLayoutCreateInfo pipelineLayoutCreateInfo{VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO};
        pipelineLayoutCreateInfo.setLayoutCount = descriptorSetLayouts.size();
        pipelineLayoutCreateInfo.pSetLayouts = descriptorSetLayouts.data();
        if (vkCreatePipelineLayout(*_device, &pipelineLayoutCreateInfo, nullptr, &_layout))
        {
            return true;
        }

        return false;
    }

    PipelineLayoutImpl::~PipelineLayoutImpl()
    {
        vkDestroyPipelineLayout(*_device, _layout, nullptr);
    }

    PipelineLayout::PipelineLayout(DeviceImpl *device) : impl(std::make_unique<PipelineLayoutImpl>(device)) {}

    bool PipelineLayout::initialize(const std::shared_ptr<PipelineLayoutInfo> &info)
    {
        if (impl->initialize(*info))
        {
            return true;
        }

        return false;
    }

    PipelineLayout::~PipelineLayout() {}
}
