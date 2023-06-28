#pragma once

#include <string>
#include <vector>
#include <memory>

namespace binding::gfx
{
    class Shader;

    enum ShaderStageFlagBits
    {
        VERTEX = 0x1,
        FRAGMENT = 0x10
    };
    // typedef uint32_t ShaderStageFlags;

    struct ShaderStage
    {
        std::string source;
        ShaderStageFlagBits type;
    };

    using ShaderStageVector = std::vector<std::shared_ptr<ShaderStage>>;

    struct ShaderInfo
    {
        std::shared_ptr<ShaderStageVector> stages{new ShaderStageVector()};
    };
}
