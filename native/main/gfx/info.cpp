#include "info.hpp"

namespace gfx
{
    const std::unordered_map<Format, FormatInfo> FormatInfos{
        {Format::UNDEFINED, {"UNDEFINED", 0, 0}},
        {Format::R8_UINT, {"R8_UINT", 1, 1}},
        {Format::RGBA8_UNORM, {"RGBA8_UNORM", 4, 4}},
        {Format::RGBA8_UINT, {"RGBA8_UINT", 4, 4}},
        {Format::RGBA8_SRGB, {"RGBA8_SRGB", 4, 4}},
        {Format::R16_UINT, {"R16_UINT", 2, 1}},
        {Format::RGBA16_UINT, {"RGBA16_UINT", 8, 4}},
        {Format::R32_UINT, {"R32_UINT", 4, 1}},
        {Format::RG32_SFLOAT, {"RG32_SFLOAT", 8, 2}},
        {Format::RGB32_SFLOAT, {"RGB32_SFLOAT", 12, 3}},
        {Format::RGBA32_UINT, {"RGBA32_UINT", 16, 4}},
        {Format::RGBA32_SFLOAT, {"RGBA32_SFLOAT", 16, 4}},
    };
}