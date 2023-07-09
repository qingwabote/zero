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

        std::shared_ptr<ShaderInfo> _info;

    public:
        Shader_impl *impl() { return _impl.get(); }

        const std::shared_ptr<ShaderInfo> &info() { return _info; }

        Shader(Device_impl *device);

        bool initialize(const std::shared_ptr<ShaderInfo> &info);

        ~Shader();
    };
}