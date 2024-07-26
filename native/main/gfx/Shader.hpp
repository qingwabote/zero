#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Shader_impl;

    class Shader
    {
    public:
        const std::unique_ptr<Shader_impl> impl;

        const std::shared_ptr<ShaderInfo> info;

        Shader(Device_impl *device, const std::shared_ptr<ShaderInfo> &info);

        bool initialize();

        ~Shader();
    };
}