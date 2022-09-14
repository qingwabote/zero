#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class Shader_impl
        {
            friend class Shader;

        private:
            Device_impl *_device = nullptr;

            std::vector<VkPipelineShaderStageCreateInfo> _stageInfos;

        public:
            Shader_impl(Device_impl *device);

            ~Shader_impl();
        };
    }
}
