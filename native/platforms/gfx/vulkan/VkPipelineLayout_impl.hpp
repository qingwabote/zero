#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class PipelineLayout_impl
        {
            friend class PipelineLayout;

        private:
            Device_impl *_device = nullptr;
            VkPipelineLayout _layout = nullptr;

        public:
            PipelineLayout_impl(Device_impl *device);

            operator VkPipelineLayout() const { return _layout; }

            ~PipelineLayout_impl();
        };
    }
}