#include "gfx/PipelineLayout.hpp"
#include "VkPipelineLayout_impl.hpp"

#include "gfx/DescriptorSetLayout.hpp"
#include "VkDescriptorSetLayout_impl.hpp"

namespace gfx
{
    PipelineLayout_impl::PipelineLayout_impl(Device_impl *device) : _device(device) {}
    PipelineLayout_impl::~PipelineLayout_impl() {}

    PipelineLayout::PipelineLayout(Device_impl *device) : _impl(std::make_unique<PipelineLayout_impl>(device)) {}

    bool PipelineLayout::initialize(const std::shared_ptr<PipelineLayoutInfo> &info)
    {
        std::vector<VkDescriptorSetLayout> descriptorSetLayouts(info->layouts->size());
        for (uint32_t i = 0; i < descriptorSetLayouts.size(); ++i)
        {

            DescriptorSetLayout *c_setLayout = info->layouts->at(i).get();
            descriptorSetLayouts[i] = *c_setLayout->impl();
        }

        VkPipelineLayoutCreateInfo pipelineLayoutCreateInfo{VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO};
        pipelineLayoutCreateInfo.setLayoutCount = descriptorSetLayouts.size();
        pipelineLayoutCreateInfo.pSetLayouts = descriptorSetLayouts.data();
        if (vkCreatePipelineLayout(*_impl->_device, &pipelineLayoutCreateInfo, nullptr, &_impl->_layout))
        {
            return true;
        }

        return false;
    }

    PipelineLayout::~PipelineLayout()
    {
        VkDevice device = *_impl->_device;
        VkPipelineLayout layout = _impl->_layout;
        vkDestroyPipelineLayout(device, layout, nullptr);
    }
}
