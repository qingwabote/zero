#include "gfx/PipelineLayout.hpp"
#include "PipelineLayout_impl.hpp"

#include "gfx/DescriptorSetLayout.hpp"
#include "DescriptorSetLayout_impl.hpp"

namespace gfx
{
    PipelineLayout_impl::PipelineLayout_impl(Device_impl *device) : _device(device) {}

    bool PipelineLayout_impl::initialize(const PipelineLayoutInfo &info)
    {
        std::vector<VkDescriptorSetLayout> descriptorSetLayouts(info.layouts->size());
        for (uint32_t i = 0; i < descriptorSetLayouts.size(); ++i)
        {

            descriptorSetLayouts[i] = *info.layouts->at(i)->impl();
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

    PipelineLayout_impl::~PipelineLayout_impl()
    {
        vkDestroyPipelineLayout(*_device, _layout, nullptr);
    }

    PipelineLayout::PipelineLayout(Device_impl *device) : _impl(std::make_unique<PipelineLayout_impl>(device)) {}

    bool PipelineLayout::initialize(const std::shared_ptr<PipelineLayoutInfo> &info)
    {
        if (_impl->initialize(*info))
        {
            return true;
        }

        return false;
    }

    PipelineLayout::~PipelineLayout() {}
}
