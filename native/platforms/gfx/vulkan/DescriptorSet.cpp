#include "log.h"
#include "gfx/DescriptorSet.hpp"
#include "gfx/DescriptorSetLayout.hpp"
#include "DescriptorSetImpl.hpp"
#include "DescriptorSetLayoutImpl.hpp"

namespace gfx
{
    DescriptorSetImpl::DescriptorSetImpl(DeviceImpl *device) : _device(device) {}

    void DescriptorSetImpl::initialize(VkDescriptorSet descriptorSet)
    {
        _descriptorSet = descriptorSet;
    }

    void DescriptorSetImpl::bindBuffer(uint32_t binding, const std::shared_ptr<BufferImpl> &buffer, double range)
    {
        auto it = _buffers.find(binding);
        if (it != _buffers.end())
        {
            it->second.first->off(BufferImplEvent::RESET, it->second.second);
        }

        auto f = [=]
        {
            VkDescriptorBufferInfo bufferInfo = {};
            bufferInfo.buffer = *buffer;
            //"For VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER_DYNAMIC and VK_DESCRIPTOR_TYPE_STORAGE_BUFFER_DYNAMIC descriptor types, offset is the base offset from which the dynamic offset is applied and range is the static size used for all dynamic offsets."
            // https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDescriptorBufferInfo.html#_description
            bufferInfo.offset = 0;
            bufferInfo.range = range ? range : buffer->info->size;

            VkWriteDescriptorSet write = {};
            write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write.dstBinding = binding;
            write.dstSet = _descriptorSet;
            write.descriptorType = range ? VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER_DYNAMIC : VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
            write.descriptorCount = 1;
            write.pBufferInfo = &bufferInfo;

            vkUpdateDescriptorSets(*_device, 1, &write, 0, nullptr);
        };

        if (buffer->info->size)
        {
            f();
        }

        _buffers[binding] = std::make_pair(buffer, buffer->on(BufferImplEvent::RESET, std::move(f)));
    }

    void DescriptorSetImpl::bindTexture(uint32_t binding, const std::shared_ptr<TextureImpl> &texture, const std::shared_ptr<SamplerImpl> &sampler)
    {
        auto it = _textures.find(binding);
        if (it != _textures.end())
        {
            it->second.first->off(TextureImplEvent::RESET, it->second.second);
        }

        auto f = [=]
        {
            VkImageUsageFlags usage = static_cast<VkImageUsageFlags>(texture->info->usage);
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
        };

        if (texture->info->width && texture->info->height)
        {
            f();
        }

        _textures[binding] = std::make_pair(texture, texture->on(TextureImplEvent::RESET, std::move(f)));
        _samplers[binding] = sampler;
    }

    DescriptorSetImpl::~DescriptorSetImpl()
    {
        for (auto &&it : _buffers)
        {
            it.second.first->off(BufferImplEvent::RESET, it.second.second);
        }
        for (auto &&it : _textures)
        {
            it.second.first->off(TextureImplEvent::RESET, it.second.second);
        }
    }

    DescriptorSet::DescriptorSet(DeviceImpl *device, const std::shared_ptr<DescriptorSetLayout> &layout) : impl(std::make_unique<DescriptorSetImpl>(device)), layout(layout) {}

    bool DescriptorSet::initialize()
    {
        auto &pool = layout->impl->pool;
        if (pool->empty())
        {
            pool->multiply();
            // ZERO_LOG_INFO("DescriptorSetPool multiply: layout name \"%s\"", layout->name.c_str());
        }
        impl->initialize(pool->get());

        return false;
    }

    void DescriptorSet::bindBuffer(uint32_t binding, const std::shared_ptr<Buffer> &buffer, double range)
    {
        impl->bindBuffer(binding, buffer->impl, range);
    }

    void DescriptorSet::bindTexture(uint32_t binding, const std::shared_ptr<Texture> &texture, const std::shared_ptr<Sampler> &sampler)
    {
        impl->bindTexture(binding, texture->impl, sampler->impl);
    }

    DescriptorSet::~DescriptorSet()
    {
        layout->impl->pool->put(*impl);
    };
}
