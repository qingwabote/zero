#pragma once

#include "Device_impl.hpp"
#include "gfx/info.hpp"

#include <unordered_map>

namespace gfx
{
    class Shader_impl
    {
    private:
        Device_impl *_device{nullptr};

        std::unordered_map<uint32_t, std::string> _attributeLocations;

        std::vector<VkPipelineShaderStageCreateInfo> _stages;

    public:
        const std::unordered_map<uint32_t, std::string> &attributeLocations;

        const std::vector<VkPipelineShaderStageCreateInfo> &stages;

        Shader_impl(Device_impl *device);

        bool initialize(const ShaderInfo &info);

        ~Shader_impl();
    };
}
