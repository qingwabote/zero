#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class Pipeline_impl
        {
            friend class Pipeline;

        private:
            Device_impl *_device = nullptr;
            VkPipelineLayout _layout = nullptr;
            VkPipeline _pipeline = nullptr;

        public:
            Pipeline_impl(Device_impl *device);
            ~Pipeline_impl();
        };
    }
}