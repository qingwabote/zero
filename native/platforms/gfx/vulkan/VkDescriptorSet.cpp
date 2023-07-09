#include "log.h"
#include "gfx/DescriptorSet.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "gfx/DescriptorSetLayout.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "VkTexture_impl.hpp"
#include "VkSampler_impl.hpp"

namespace gfx
{
    DescriptorSet_impl::DescriptorSet_impl(Device_impl *device) : _device(device) {}

    DescriptorSet_impl::~DescriptorSet_impl() {}

    DescriptorSet::DescriptorSet(Device_impl *device) : _impl(std::make_unique<DescriptorSet_impl>(device)) {}

    bool DescriptorSet::initialize(const std::shared_ptr<DescriptorSetLayout> &layout)
    {
        auto &pool = layout->impl()->pool();
        if (pool.empty())
        {
            pool.multiply();
            // ZERO_LOG("DescriptorSetPool multiply: layout name \"%s\"", layout->name.c_str());
        }
        _impl->_descriptorSet = pool.get();
        _impl->_layout = layout->impl();
        _layout = layout;
        return false;
    }

    void DescriptorSet::bindBuffer(uint32_t binding, const std::shared_ptr<Buffer> &c_buffer, double range)
    {
        auto size = c_buffer->info()->size;

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

        _buffers.emplace(binding, c_buffer);
    }

    void DescriptorSet::bindTexture(uint32_t binding, const std::shared_ptr<Texture> &texture, const std::shared_ptr<Sampler> &sampler)
    {
        VkImageUsageFlags usage = static_cast<VkImageUsageFlags>(texture->info()->usage);
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

        _textures.emplace(binding, texture);
        _samplers.emplace(binding, sampler);
    }

    DescriptorSet::~DescriptorSet()
    {
        _impl->_layout->pool().put(_impl->_descriptorSet);
    };
}
