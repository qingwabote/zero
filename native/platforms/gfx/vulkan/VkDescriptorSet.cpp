#include "log.h"
#include "gfx/DescriptorSet.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkDescriptorSetLayout_impl.hpp"

namespace gfx
{
    DescriptorSet_impl::DescriptorSet_impl(Device_impl *device) : _device(device) {}

    bool DescriptorSet_impl::initialize(DescriptorSetLayout &layout)
    {
        auto &pool = layout.impl()->pool();
        if (pool.empty())
        {
            pool.multiply();
            // ZERO_LOG("DescriptorSetPool multiply: layout name \"%s\"", layout->name.c_str());
        }
        _descriptorSet = pool.get();
        _layout = layout.impl();
        return false;
    }

    void DescriptorSet_impl::bindBuffer(uint32_t binding, const std::shared_ptr<Buffer_impl> &buffer, double range)
    {
        auto it = _buffers.find(binding);
        if (it != _buffers.end())
        {
            it->second.first->off(BufferEvent_impl::RESET, it->second.second);
        }
        auto f = new auto(
            [=]
            {
                VkDescriptorBufferInfo bufferInfo = {};
                bufferInfo.buffer = *buffer;
                bufferInfo.offset = 0;
                bufferInfo.range = range ? range : buffer->info()->size;

                VkWriteDescriptorSet write = {};
                write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
                write.dstBinding = binding;
                write.dstSet = _descriptorSet;
                write.descriptorCount = 1;
                write.descriptorType = range ? VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER_DYNAMIC : VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
                write.pBufferInfo = &bufferInfo;

                vkUpdateDescriptorSets(*_device, 1, &write, 0, nullptr);
            });
        _buffers.emplace(binding, std::make_pair(buffer, buffer->on(BufferEvent_impl::RESET, f)));
        (*f)();
    }

    void DescriptorSet_impl::bindTexture(uint32_t binding, const std::shared_ptr<Texture_impl> &texture, const std::shared_ptr<Sampler_impl> &sampler)
    {
        VkImageUsageFlags usage = static_cast<VkImageUsageFlags>(texture->info()->usage);
        VkImageLayout imageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
        if (usage & VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT)
        {
            imageLayout = VK_IMAGE_LAYOUT_DEPTH_STENCIL_READ_ONLY_OPTIMAL;
        }

        VkDescriptorImageInfo imageBufferInfo = {};
        imageBufferInfo.sampler = *sampler;
        imageBufferInfo.imageView = *texture;
        imageBufferInfo.imageLayout = imageLayout;

        VkWriteDescriptorSet write = {};
        write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
        write.dstBinding = binding;
        write.dstSet = _descriptorSet;
        write.descriptorCount = 1;
        write.descriptorType = VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER;
        write.pImageInfo = &imageBufferInfo;

        vkUpdateDescriptorSets(*_device, 1, &write, 0, nullptr);

        _textures.emplace(binding, texture);
        _samplers.emplace(binding, sampler);
    }

    DescriptorSet_impl::~DescriptorSet_impl()
    {
        for (auto &&it : _buffers)
        {
            it.second.first->off(BufferEvent_impl::RESET, it.second.second);
        }
    }

    DescriptorSet::DescriptorSet(Device_impl *device) : _impl(std::make_unique<DescriptorSet_impl>(device)) {}

    bool DescriptorSet::initialize(const std::shared_ptr<DescriptorSetLayout> &layout)
    {
        _layout = layout;
        return _impl->initialize(*layout);
    }

    void DescriptorSet::bindBuffer(uint32_t binding, const std::shared_ptr<Buffer> &buffer, double range)
    {
        _impl->bindBuffer(binding, buffer->impl(), range);
    }

    void DescriptorSet::bindTexture(uint32_t binding, const std::shared_ptr<Texture> &texture, const std::shared_ptr<Sampler> &sampler)
    {
        _impl->bindTexture(binding, texture->impl(), sampler->impl());
    }

    DescriptorSet::~DescriptorSet()
    {
        _impl->_layout->pool().put(_impl->_descriptorSet);
    };
}
