#include "bindings/gfx/Shader.hpp"
#include "VkShaderImpl.hpp"

namespace binding
{
    namespace gfx
    {
        ShaderImpl::ShaderImpl(VkDevice device)
        {
        }

        bool ShaderImpl::initialize(v8::Local<v8::Object> info)
        {
            return false;
        }

        ShaderImpl::~ShaderImpl()
        {
        }

        Shader::Shader(v8::Isolate *isolate, std::unique_ptr<ShaderImpl> impl)
            : Binding(isolate), _impl(std::move(impl)) {}
        bool Shader::initialize(v8::Local<v8::Object> info) { return _impl->initialize(info); }
        Shader::~Shader() {}
    }
}
