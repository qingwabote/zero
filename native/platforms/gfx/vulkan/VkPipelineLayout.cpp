#include "bindings/gfx/PipelineLayout.hpp"
#include "VkPipelineLayout_impl.hpp"

#include "bindings/gfx/DescriptorSetLayout.hpp"
#include "VKDescriptorSetLayout_impl.hpp"

namespace binding
{
    namespace gfx
    {
        PipelineLayout_impl::PipelineLayout_impl(Device_impl *device) : _device(device) {}
        PipelineLayout_impl::~PipelineLayout_impl() {}

        PipelineLayout::PipelineLayout(std::unique_ptr<PipelineLayout_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        bool PipelineLayout::initialize(v8::Local<v8::Array> js_setLayouts)
        {
            v8::Isolate *isolate = v8::Isolate::GetCurrent();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            std::vector<VkDescriptorSetLayout> descriptorSetLayouts(js_setLayouts->Length());
            for (uint32_t i = 0; i < js_setLayouts->Length(); ++i)
            {

                v8::Local<v8::Object> js_setLayout = js_setLayouts->Get(context, i).ToLocalChecked().As<v8::Object>();
                DescriptorSetLayout *c_setLayout = retain<DescriptorSetLayout>(js_setLayout);
                descriptorSetLayouts[i] = c_setLayout->impl()->setLayout();
            }

            VkPipelineLayoutCreateInfo pipelineLayoutCreateInfo{VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO};
            pipelineLayoutCreateInfo.setLayoutCount = descriptorSetLayouts.size();
            pipelineLayoutCreateInfo.pSetLayouts = descriptorSetLayouts.data();
            if (vkCreatePipelineLayout(_impl->_device->device(), &pipelineLayoutCreateInfo, nullptr, &_impl->_layout))
            {
                return true;
            }

            return false;
        }

        PipelineLayout::~PipelineLayout()
        {
            vkDestroyPipelineLayout(_impl->_device->device(), _impl->_layout, nullptr);
        }
    }
}