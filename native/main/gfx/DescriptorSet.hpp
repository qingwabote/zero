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
        std::shared_ptr<DescriptorSetLayout> _layout;

    public:
        DescriptorSet_impl &impl() { return *_impl.get(); }

        const std::shared_ptr<DescriptorSetLayout> &layout() { return _layout; };

        DescriptorSet(Device_impl *device);

        bool initialize(const std::shared_ptr<DescriptorSetLayout> &layout);

        void bindBuffer(uint32_t binding, const std::shared_ptr<Buffer> &buffer, double range = 0);

        void bindTexture(uint32_t binding, const std::shared_ptr<Texture> &texture, const std::shared_ptr<Sampler> &sampler);

        ~DescriptorSet();
    };
}
