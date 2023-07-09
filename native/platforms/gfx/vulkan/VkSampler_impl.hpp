#pragma once

#include "VkDevice_impl.hpp"

namespace gfx
{
    class Sampler_impl
    {
        friend class Sampler;

    private:
        Device_impl *_device = nullptr;

        VkSampler _sampler = nullptr;

    public:
        Sampler_impl(Device_impl *device);

        operator VkSampler() { return _sampler; }

        ~Sampler_impl();
    };

}
