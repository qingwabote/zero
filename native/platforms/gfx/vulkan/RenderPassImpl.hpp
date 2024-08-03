#pragma once

#include "DeviceImpl.hpp"

namespace gfx
{
    class RenderPassImpl
    {
    private:
        DeviceImpl *_device{nullptr};

        VkRenderPass _renderPass{nullptr};

    public:
        RenderPassImpl(DeviceImpl *device);

        bool initialize(const RenderPassInfo &info);

        operator VkRenderPass() { return _renderPass; }

        ~RenderPassImpl();
    };

}
