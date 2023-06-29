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

    class ShaderInfo
    {
    public:
        std::shared_ptr<std::vector<std::string>> sources{new std::vector<std::string>()};
        std::shared_ptr<std::vector<float>> types{new std::vector<float>()};
    };
}
