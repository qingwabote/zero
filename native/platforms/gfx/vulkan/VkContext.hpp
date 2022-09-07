#pragma once

#include <vulkan/vulkan.h>

namespace binding
{
    namespace gfx
    {
        class Context
        {
        private:
            uint32_t _version;
            VkDevice _device = nullptr;

        public:
            uint32_t version()
            {
                return _version;
            }

            VkDevice device()
            {
                return _device;
            }

            Context(uint32_t version, VkDevice device) : _version(version), _device(device){};
            ~Context(){};
        };
    }
}