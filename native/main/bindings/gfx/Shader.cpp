#include "Shader.hpp"

std::shared_ptr<binding::gfx::ShaderInfo> swig_ShaderInfo_js2c(v8::Local<v8::Value> js_obj);

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Shader::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            auto ctor = Binding::createTemplate();

            sugar::v8::ctor_name(ctor, "Shader");
            sugar::v8::ctor_accessor(
                ctor,
                "info",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Shader>(info.This());
                    info.GetReturnValue().Set(c_obj->_info.Get(info.GetIsolate()));
                });
            sugar::v8::ctor_function(
                ctor,
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Shader>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(swig_ShaderInfo_js2c(info[0])));
                });

            return scope.Escape(ctor);
        }
    }
}