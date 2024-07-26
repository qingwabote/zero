#pragma once

#include "DeviceImpl.hpp"

namespace gfx
{
    class SamplerImpl
    {
        friend class Sampler;

    private:
        DeviceImpl *_device = nullptr;

        VkSampler _sampler = nullptr;

    public:
        SamplerImpl(DeviceImpl *device);

        operator VkSampler() { return _sampler; }

        ~SamplerImpl();
    };

}
