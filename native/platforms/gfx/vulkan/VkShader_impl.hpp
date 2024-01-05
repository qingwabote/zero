#pragma once

#include "VkDevice_impl.hpp"
#include "gfx/info.hpp"

#include <unordered_map>

namespace gfx
{
    class Shader_impl
    {
    private:
        Device_impl *_device{nullptr};

        std::unordered_map<std::string, uint32_t> _attributeLocations;

        std::vector<VkPipelineShaderStageCreateInfo> _stages;

    public:
        const std::unordered_map<std::string, uint32_t> &attributeLocations() { return _attributeLocations; }

        std::vector<VkPipelineShaderStageCreateInfo> &stages() { return _stages; }

        Shader_impl(Device_impl *device);

        bool initialize(const ShaderInfo &info);

        ~Shader_impl();
    };
}
