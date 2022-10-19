#include "bindings/gfx/DescriptorSet.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "VkTexture_impl.hpp"
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
            auto err = vkAllocateDescriptorSets(_impl->_device->device(), &allocInfo, &_impl->_descriptorSet);
            if (err)
            {
                return true;
            }

            return false;
        }

        void DescriptorSet::bindBuffer(uint32_t binding, Buffer *c_buffer, double range)
        {
            auto size = sugar::v8::object_get(c_buffer->retrieve("info"), "size").As<v8::Number>()->Value();

            VkDescriptorBufferInfo bufferInfo = {};
            bufferInfo.buffer = c_buffer->impl();
            bufferInfo.offset = 0;
            bufferInfo.range = range ? range : size;

            VkWriteDescriptorSet write = {};
            write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write.dstBinding = binding;
            write.dstSet = _impl->_descriptorSet;
            write.descriptorCount = 1;
            write.descriptorType = range ? VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER_DYNAMIC : VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
            write.pBufferInfo = &bufferInfo;

            vkUpdateDescriptorSets(_impl->_device->device(), 1, &write, 0, nullptr);
        }

        void DescriptorSet::bindTexture(uint32_t binding, Texture *texture)
        {
            VkDescriptorImageInfo imageBufferInfo = {};
            imageBufferInfo.sampler = _impl->_device->defaultSampler();
            imageBufferInfo.imageView = texture->impl().imageView();
            imageBufferInfo.imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;

            VkWriteDescriptorSet write = {};
            write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write.dstBinding = binding;
            write.dstSet = _impl->_descriptorSet;
            write.descriptorCount = 1;
            write.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
            write.pImageInfo = &imageBufferInfo;

            vkUpdateDescriptorSets(_impl->_device->device(), 1, &write, 0, nullptr);
        }

        DescriptorSet::~DescriptorSet()
        {
            // You don't need to explicitly clean up descriptor sets, because they will be automatically freed when the descriptor pool is destroyed
        }
    }
}