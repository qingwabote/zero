#include "Shader.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Shader::createTemplate()
        {
            v8::EscapableHandleScope scope(_isolate);

            sugar::v8::Class cls{_isolate, "Shader"};
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<Shader *>(info.This()->GetAlignedPointerFromInternalField(0));
                    info.GetReturnValue().Set(cobj->initialize(info[0].As<v8::Object>()));
                });

            return scope.Escape(cls.flush());
        }
    }
}