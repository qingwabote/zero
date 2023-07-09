#pragma once

#include "VkDevice_impl.hpp"

namespace gfx
{
    class RenderPass_impl
    {
        friend class RenderPass;

    private:
        Device_impl *_device = nullptr;

        VkRenderPass _renderPass = nullptr;

        std::vector<VkClearValue> _clearValues;

    public:
        RenderPass_impl(Device_impl *device);

        std::vector<VkClearValue> &clearValues() { return _clearValues; }

        operator VkRenderPass() { return _renderPass; }

        ~RenderPass_impl();
    };

}
