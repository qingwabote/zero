#pragma once

#include "gfx/Buffer.hpp"
#include "gfx/Texture.hpp"
#include "gfx/Sampler.hpp"

namespace gfx
{
    class DeviceImpl;
    class DescriptorSetLayout;
    class DescriptorSetImpl;
    class DescriptorSet
    {
    public:
        const std::unique_ptr<DescriptorSetImpl> impl;

        const std::shared_ptr<DescriptorSetLayout> layout;

        DescriptorSet(DeviceImpl *device, const std::shared_ptr<DescriptorSetLayout> &layout);

        bool initialize();

        void bindBuffer(uint32_t binding, const std::shared_ptr<Buffer> &buffer, double range = 0);

        void bindTexture(uint32_t binding, const std::shared_ptr<Texture> &texture, const std::shared_ptr<Sampler> &sampler);

        ~DescriptorSet();
    };
}
