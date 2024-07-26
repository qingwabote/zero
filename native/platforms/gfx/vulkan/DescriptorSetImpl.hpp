#pragma once

#include "BufferImpl.hpp"
#include "TextureImpl.hpp"
#include "SamplerImpl.hpp"
#include <unordered_map>

namespace gfx
{
    class DescriptorSetImpl
    {
    private:
        DeviceImpl *_device = nullptr;
        VkDescriptorSet _descriptorSet = nullptr;

        std::unordered_map<uint32_t, std::pair<std::shared_ptr<BufferImpl>, event::Handle>> _buffers;
        std::unordered_map<uint32_t, std::shared_ptr<TextureImpl>> _textures;
        std::unordered_map<uint32_t, std::shared_ptr<SamplerImpl>> _samplers;

    public:
        DescriptorSetImpl(DeviceImpl *device);

        void initialize(VkDescriptorSet descriptorSet);

        void bindBuffer(uint32_t binding, const std::shared_ptr<BufferImpl> &buffer, double range);

        void bindTexture(uint32_t binding, const std::shared_ptr<TextureImpl> &texture, const std::shared_ptr<SamplerImpl> &sampler);

        operator VkDescriptorSet() const { return _descriptorSet; }

        ~DescriptorSetImpl();
    };
}
