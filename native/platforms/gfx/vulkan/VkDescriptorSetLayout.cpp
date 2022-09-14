#include "bindings/gfx/DescriptorSetLayout.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        DescriptorSetLayout_impl::DescriptorSetLayout_impl(Device_impl *device) : _device(device) {}

        DescriptorSetLayout_impl::~DescriptorSetLayout_impl() {}

        DescriptorSetLayout::DescriptorSetLayout(std::unique_ptr<DescriptorSetLayout_impl> impl) : Binding(), _impl(std::move(impl)) {}

        bool DescriptorSetLayout::initialize(v8::Local<v8::Array> js_setLayoutBindings)
        {
            uint32_t bindingCount = js_setLayoutBindings->Length();
            std::vector<VkDescriptorSetLayoutBinding> setLayoutBindings{bindingCount};
            for (uint32_t i = 0; i < bindingCount; i++)
            {
                v8::Local<v8::Object> js_layoutBinding = js_setLayoutBindings->Get(js_setLayoutBindings->GetCreationContext().ToLocalChecked(), i).ToLocalChecked().As<v8::Object>();

                uint32_t binding = sugar::v8::object_get(js_layoutBinding, "binding").As<v8::Number>()->Value();
                uint32_t descriptorType = sugar::v8::object_get(js_layoutBinding, "descriptorType").As<v8::Number>()->Value();
                uint32_t descriptorCount = sugar::v8::object_get(js_layoutBinding, "descriptorCount").As<v8::Number>()->Value();
                uint32_t stageFlags = sugar::v8::object_get(js_layoutBinding, "stageFlags").As<v8::Number>()->Value();

                setLayoutBindings[i].binding = binding;
                setLayoutBindings[i].descriptorType = static_cast<VkDescriptorType>(descriptorType);
                setLayoutBindings[i].descriptorCount = descriptorCount;
                setLayoutBindings[i].stageFlags = static_cast<VkShaderStageFlagBits>(stageFlags);
            }

            VkDescriptorSetLayoutCreateInfo layoutInfo = {};
            layoutInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO;
            layoutInfo.pNext = nullptr;
            layoutInfo.bindingCount = bindingCount;
            layoutInfo.pBindings = setLayoutBindings.data();
            layoutInfo.flags = 0;

            if (vkCreateDescriptorSetLayout(_impl->_device->device(), &layoutInfo, nullptr, &_impl->_setLayout))
            {
                return true;
            }

            return false;
        }

        DescriptorSetLayout::~DescriptorSetLayout()
        {
            vkDestroyDescriptorSetLayout(_impl->_device->device(), _impl->_setLayout, nullptr);
        }
    }
}
