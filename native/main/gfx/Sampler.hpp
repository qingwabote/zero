#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Sampler_impl;

    class Sampler
    {
    public:
        const std::shared_ptr<Sampler_impl> impl;

        Sampler(Device_impl *device);

        bool initialize(const std::shared_ptr<SamplerInfo> &info);

        ~Sampler();
    };
}
