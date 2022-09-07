#pragma once

#include "vulkan/vulkan.hpp"

namespace binding
{
    namespace gfx
    {
        class PipelineImpl
        {
        private:
            /* data */
        public:
            PipelineImpl(VkDevice device);
            ~PipelineImpl(){};
        };
    }
}