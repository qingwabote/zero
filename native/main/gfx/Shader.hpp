#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class ShaderImpl;

    class Shader
    {
    public:
        const std::unique_ptr<ShaderImpl> impl;

        const std::shared_ptr<ShaderInfo> info;

        Shader(DeviceImpl *device, const std::shared_ptr<ShaderInfo> &info);

        bool initialize();

        ~Shader();
    };
}