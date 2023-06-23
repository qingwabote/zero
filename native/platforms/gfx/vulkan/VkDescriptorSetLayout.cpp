#include "bindings/gfx/DescriptorSetLayout.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include "bindings/gfx/DescriptorSet.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding::gfx
{
    DescriptorSetLayout_impl::DescriptorSetLayout_impl(Device_impl *device) : _device(device)
    {
        _pool = std::make_unique<DescriptorSetPool>(*device);
    }

    DescriptorSetLayout_impl::~DescriptorSetLayout_impl() {}

    DescriptorSetLayout::DescriptorSetLayout(std::unique_ptr<DescriptorSetLayout_impl> impl) : Binding(), _impl(std::move(impl)) {}

    bool DescriptorSetLayout::initialize(v8::Local<v8::Array> js_setLayoutBindings)
    {
        uint32_t maxSets{10};

        uint32_t bindingCount = js_setLayoutBindings->Length();
        std::vector<VkDescriptorSetLayoutBinding> setLayoutBindings{bindingCount};
        std::unordered_map<VkDescriptorType, uint32_t> type2count;
        for (uint32_t i = 0; i < bindingCount; i++)
        {
            v8::Local<v8::Object> js_layoutBinding = js_setLayoutBindings->Get(js_setLayoutBindings->GetCreationContext().ToLocalChecked(), i).ToLocalChecked().As<v8::Object>();

            uint32_t binding = sugar::v8::object_get(js_layoutBinding, "binding").As<v8::Number>()->Value();
            VkDescriptorType descriptorType = static_cast<VkDescriptorType>(sugar::v8::object_get(js_layoutBinding, "descriptorType").As<v8::Number>()->Value());
            uint32_t descriptorCount = sugar::v8::object_get(js_layoutBinding, "descriptorCount").As<v8::Number>()->Value();
            VkShaderStageFlagBits stageFlags = static_cast<VkShaderStageFlagBits>(sugar::v8::object_get(js_layoutBinding, "stageFlags").As<v8::Number>()->Value());

            setLayoutBindings[i].binding = binding;
            setLayoutBindings[i].descriptorType = descriptorType;
            setLayoutBindings[i].descriptorCount = descriptorCount;
            setLayoutBindings[i].stageFlags = stageFlags;

            type2count[descriptorType] += maxSets * descriptorCount;
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

        return false;
    }

    DescriptorSet *DescriptorSetLayout::createDescriptorSet()
    {
        return new DescriptorSet(std::make_unique<DescriptorSet_impl>(_impl->_device), this);
    }

    DescriptorSetLayout::~DescriptorSetLayout()
    {
        vkDestroyDescriptorSetLayout(*_impl->_device, _impl->_setLayout, nullptr);
    }
}
