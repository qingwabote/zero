#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class RenderPass_impl;

    class RenderPass
    {
    public:
        const std::unique_ptr<RenderPass_impl> impl;

        const std::shared_ptr<RenderPassInfo> info;

        RenderPass(Device_impl *device, const std::shared_ptr<RenderPassInfo> &info);

        bool initialize();

        ~RenderPass();
    };
}
