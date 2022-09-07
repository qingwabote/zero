#include "bindings/gfx/Shader.hpp"
#include "VkShaderImpl.hpp"

namespace binding
{
    namespace gfx
    {
        ShaderImpl::ShaderImpl(VkDevice device)
        {
        }

        v8::Local<v8::Object> ShaderImpl::info()
        {
            return _info.Get(v8::Isolate::GetCurrent());
        }

        bool ShaderImpl::initialize(v8::Local<v8::Object> info)
        {
            _info.Reset(info->GetIsolate(), info);

            return false;
        }

        ShaderImpl::~ShaderImpl()
        {
            _info.Reset();
        }

        Shader::Shader(std::unique_ptr<ShaderImpl> impl)
            : Binding(), _impl(std::move(impl)) {}
        v8::Local<v8::Object> Shader::info() { return _impl->info(); }
        bool Shader::initialize(v8::Local<v8::Object> info) { return _impl->initialize(info); }
        Shader::~Shader() {}
    }
}
