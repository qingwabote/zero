#pragma once

#include "info.hpp"

namespace binding
{
    namespace gfx
    {
        class Device_impl;
        class Sampler_impl;

        class Sampler
        {
        private:
            std::unique_ptr<Sampler_impl> _impl;

        public:
            Sampler_impl &impl() { return *_impl.get(); }

            Sampler(Device_impl *device);

            bool initialize(const std::shared_ptr<SamplerInfo> &info);

            ~Sampler();
        };
    }
}