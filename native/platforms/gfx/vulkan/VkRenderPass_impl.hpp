#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class RenderPass_impl
        {
            friend class RenderPass;

        private:
            Device_impl *_device = nullptr;

            VkRenderPass _renderPass = nullptr;

        public:
            RenderPass_impl(Device_impl *device);

            operator VkRenderPass() { return _renderPass; }

            ~RenderPass_impl();
        };

    }
}
