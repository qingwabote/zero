#include "bindings/gfx/DescriptorSet.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "VkTexture_impl.hpp"
#include "VkSampler_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        DescriptorSet_impl::DescriptorSet_impl(Device_impl *device) : _device(device) {}

        DescriptorSet_impl::~DescriptorSet_impl() {}

        DescriptorSet::DescriptorSet(std::unique_ptr<DescriptorSet_impl> impl, DescriptorSetLayout *layout) : Binding(), _impl(std::move(impl))
        {
            retain(layout->js_obj(), _layout);
            _impl->_layout = layout->impl();
            _impl->_descriptorSet = layout->impl()->pool().get();
        }

        void DescriptorSet::bindBuffer(uint32_t binding, Buffer *c_buffer, double range)
        {
            auto size = sugar::v8::object_get(c_buffer->info(), "size").As<v8::Number>()->Value();

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

            vkUpdateDescriptorSets(*_impl->_device, 1, &write, 0, nullptr);
        }

        void DescriptorSet::bindTexture(uint32_t binding, Texture *texture, Sampler *sampler)
        {
            uint32_t usage = sugar::v8::object_get(texture->info(), "usage").As<v8::Number>()->Value();
            VkImageLayout imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
            if (usage & VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT)
            {
                imageLayout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_READ_ONLY_OPTIMAL;
            }

            VkDescriptorImageInfo imageBufferInfo = {};
            imageBufferInfo.sampler = sampler->impl();
            imageBufferInfo.imageView = texture->impl();
            imageBufferInfo.imageLayout = imageLayout;

            VkWriteDescriptorSet write = {};
            write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write.dstBinding = binding;
            write.dstSet = _impl->_descriptorSet;
            write.descriptorCount = 1;
            write.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
            write.pImageInfo = &imageBufferInfo;

            vkUpdateDescriptorSets(*_impl->_device, 1, &write, 0, nullptr);
        }

        DescriptorSet::~DescriptorSet()
        {
            _impl->_layout->pool().put(_impl->_descriptorSet);
        };
    }
}