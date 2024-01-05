#pragma once

#include <string>
#include <unordered_map>

namespace gfx
{
    enum class Format
    {
        UNDEFINED = 0,
        R8_UINT = 13,
        RGBA8_UNORM = 37,
        RGBA8_UINT = 41,
        RGBA8_SRGB = 43,
        R16_UINT = 74,
        RGBA16_UINT = 95,
        R32_UINT = 98,
        RG32_SFLOAT = 103,
        RGB32_SFLOAT = 106,
        RGBA32_UINT = 107,
        RGBA32_SFLOAT = 109,
    };

    struct FormatInfo
    {
        std::string name;
        uint32_t bytes;
        uint32_t nums;
    };

    extern const std::unordered_map<Format, FormatInfo> FormatInfos;
}