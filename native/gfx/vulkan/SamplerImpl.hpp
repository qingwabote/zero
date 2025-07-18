#pragma once

#include "DeviceImpl.hpp"

namespace gfx
{
    class SamplerImpl
    {
    private:
        DeviceImpl *_device = nullptr;

        VkSampler _sampler = nullptr;

    public:
        SamplerImpl(DeviceImpl *device);

        bool initialize(const SamplerInfo &info);

        operator VkSampler() { return _sampler; }

        ~SamplerImpl();
    };

}
