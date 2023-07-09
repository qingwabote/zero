#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class RenderPass_impl;

    class RenderPass
    {
    private:
        std::unique_ptr<RenderPass_impl> _impl;

        std::shared_ptr<RenderPassInfo> _info;

    public:
        RenderPass_impl &impl() { return *_impl.get(); }

        const std::shared_ptr<RenderPassInfo> &info() { return _info; }

        RenderPass(Device_impl *device);

        bool initialize(const std::shared_ptr<RenderPassInfo> &info);

        ~RenderPass();
    };
}
