#pragma once

#include "Device_impl.hpp"

namespace gfx
{
    class RenderPass_impl
    {
    private:
        Device_impl *_device{nullptr};

        VkRenderPass _renderPass{nullptr};

    public:
        RenderPass_impl(Device_impl *device);

        bool initialize(const RenderPassInfo &info);

        operator VkRenderPass() { return _renderPass; }

        ~RenderPass_impl();
    };

}
