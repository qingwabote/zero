#pragma once

#include "vulkan/vulkan.hpp"

namespace binding
{
    namespace gfx
    {
        class Pipeline_impl
        {
            friend class Pipeline;

        private:
            /* data */
        public:
            Pipeline_impl(VkDevice device);
            ~Pipeline_impl();
        };
    }
}