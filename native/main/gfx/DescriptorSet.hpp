#pragma once

#include "gfx/Buffer.hpp"
#include "gfx/Texture.hpp"
#include "gfx/Sampler.hpp"

namespace gfx
{
    class Device_impl;
    class DescriptorSetLayout;
    class DescriptorSet_impl;
    class DescriptorSet
    {
    private:
        std::unique_ptr<DescriptorSet_impl> _impl;

    public:
        DescriptorSet_impl &impl() { return *_impl.get(); }

        const std::shared_ptr<DescriptorSetLayout> layout;

        DescriptorSet(Device_impl *device, const std::shared_ptr<DescriptorSetLayout> &layout);

        bool initialize();

        void bindBuffer(uint32_t binding, const std::shared_ptr<Buffer> &buffer, double range = 0);

        void bindTexture(uint32_t binding, const std::shared_ptr<Texture> &texture, const std::shared_ptr<Sampler> &sampler);

        ~DescriptorSet();
    };
}
