#include "bindings/gfx/DescriptorSet.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        DescriptorSet_impl::DescriptorSet_impl(Device_impl *device) : _device(device) {}

        DescriptorSet_impl::~DescriptorSet_impl() {}

        DescriptorSet::DescriptorSet(std::unique_ptr<DescriptorSet_impl> impl) : Binding(), _impl(std::move(impl)) {}

        bool DescriptorSet::initialize(DescriptorSetLayout *c_setLayout)
        {
            VkDescriptorSetAllocateInfo allocInfo = {};
            allocInfo.pNext = nullptr;
            allocInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
            allocInfo.descriptorPool = _impl->_device->descriptorPool();
            allocInfo.descriptorSetCount = 1;
            VkDescriptorSetLayout setLayout = c_setLayout->impl()->setLayout();
            allocInfo.pSetLayouts = &setLayout;

            if (vkAllocateDescriptorSets(_impl->_device->device(), &allocInfo, &_impl->_descriptorSet))
            {
                return true;
            }

            return false;
        }

        void DescriptorSet::bindBuffer(uint32_t binding, Buffer *c_buffer)
        {
            auto size = sugar::v8::object_get(c_buffer->info(), "size").As<v8::Number>();

            VkDescriptorBufferInfo bufferInfo = {};
            bufferInfo.buffer = c_buffer->impl();
            bufferInfo.offset = 0;
            bufferInfo.range = size->Value();

            VkWriteDescriptorSet write = {};
            write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write.pNext = nullptr;
            write.dstBinding = binding;
            write.dstSet = _impl->_descriptorSet;
            write.descriptorCount = 1;
            write.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
            write.pBufferInfo = &bufferInfo;

            vkUpdateDescriptorSets(_impl->_device->device(), 1, &write, 0, nullptr);
        }

        DescriptorSet::~DescriptorSet() {}
    }
}