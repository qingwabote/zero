#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class SamplerImpl;

    class Sampler
    {
    public:
        const std::shared_ptr<SamplerImpl> impl;

        Sampler(DeviceImpl *device);

        bool initialize(const std::shared_ptr<SamplerInfo> &info);

        ~Sampler();
    };
}
