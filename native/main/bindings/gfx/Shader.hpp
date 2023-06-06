#pragma once

#include "Binding.hpp"

namespace binding::gfx
{
    enum ShaderStageFlagBits
    {
        VERTEX = 0x1,
        FRAGMENT = 0x10
    };
    typedef uint32_t ShaderStageFlags;

    class Shader_impl;

    class Shader : public Binding
    {
    private:
        std::unique_ptr<Shader_impl> _impl;

        sugar::v8::Weak<v8::Object> _info;

    protected:
        v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Shader_impl *impl() { return _impl.get(); }

        Shader(std::unique_ptr<Shader_impl> impl);

        bool initialize(v8::Local<v8::Object> info);

        ~Shader();
    };
}