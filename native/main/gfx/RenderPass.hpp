#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class RenderPassImpl;

    class RenderPass
    {
    public:
        const std::unique_ptr<RenderPassImpl> impl;

        const std::shared_ptr<RenderPassInfo> info;

        RenderPass(DeviceImpl *device, const std::shared_ptr<RenderPassInfo> &info);

        bool initialize();

        ~RenderPass();
    };
}
