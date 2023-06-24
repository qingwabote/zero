#pragma once

#include "VkDevice_impl.hpp"
#include "bindings/gfx/info.hpp"

namespace binding
{
    namespace gfx
    {
        class Shader_impl
        {
        private:
            Device_impl *_device{nullptr};

            std::vector<VkPipelineShaderStageCreateInfo> _stages;

        public:
            std::vector<VkPipelineShaderStageCreateInfo> &stages() { return _stages; }

            Shader_impl(Device_impl *device);

            bool initialize(const ShaderInfo &info);

            ~Shader_impl();
        };
    }
}
