#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Shader_impl;

    class Shader
    {
    private:
        std::unique_ptr<Shader_impl> _impl;

    public:
        Shader_impl *impl() { return _impl.get(); }

        const std::shared_ptr<ShaderInfo> info;

        Shader(Device_impl *device, const std::shared_ptr<ShaderInfo> &info);

        bool initialize();

        ~Shader();
    };
}