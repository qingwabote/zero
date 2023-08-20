#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Sampler_impl;

    class Sampler
    {
    private:
        std::shared_ptr<Sampler_impl> _impl;

    public:
        const std::shared_ptr<Sampler_impl> &impl() { return _impl; }

        Sampler(Device_impl *device);

        bool initialize(const std::shared_ptr<SamplerInfo> &info);

        ~Sampler();
    };
}
