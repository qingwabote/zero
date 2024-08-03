#pragma once

#include "DeviceImpl.hpp"
#include "gfx/info.hpp"

#include <unordered_map>

namespace gfx
{
    class ShaderImpl
    {
    private:
        DeviceImpl *_device{nullptr};

        std::unordered_map<uint32_t, std::string> _attributeLocations;

        std::vector<VkPipelineShaderStageCreateInfo> _stages;

    public:
        const std::unordered_map<uint32_t, std::string> &attributeLocations;

        const std::vector<VkPipelineShaderStageCreateInfo> &stages;

        ShaderImpl(DeviceImpl *device);

        bool initialize(const ShaderInfo &info);

        ~ShaderImpl();
    };
}
