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

    public:
        RenderPass_impl &impl() { return *_impl; }

        const std::shared_ptr<RenderPassInfo> info;

        RenderPass(Device_impl *device, const std::shared_ptr<RenderPassInfo> &info);

        bool initialize();

        ~RenderPass();
    };
}
