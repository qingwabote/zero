#pragma once

#include "DescriptorSetLayout_impl.hpp"
#include "Buffer_impl.hpp"
#include "Texture_impl.hpp"
#include "Sampler_impl.hpp"
#include "gfx/DescriptorSetLayout.hpp"
#include <unordered_map>
#include <utility>

namespace gfx
{
    class DescriptorSet_impl
    {
        friend class DescriptorSet;

    private:
        Device_impl *_device = nullptr;
        VkDescriptorSet _descriptorSet = nullptr;
        DescriptorSetLayout_impl *_layout = nullptr;

        std::unordered_map<uint32_t, std::pair<std::shared_ptr<Buffer_impl>, event::Handle>> _buffers;
        std::unordered_map<uint32_t, std::shared_ptr<Texture_impl>> _textures;
        std::unordered_map<uint32_t, std::shared_ptr<Sampler_impl>> _samplers;

    public:
        DescriptorSet_impl(Device_impl *device);

        bool initialize(DescriptorSetLayout &layout);

        void bindBuffer(uint32_t binding, const std::shared_ptr<Buffer_impl> &buffer, double range);

        void bindTexture(uint32_t binding, const std::shared_ptr<Texture_impl> &texture, const std::shared_ptr<Sampler_impl> &sampler);

        operator VkDescriptorSet() const { return _descriptorSet; }

        ~DescriptorSet_impl();
    };
}
