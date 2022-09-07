#include "Shader.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Shader::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"Shader"};
            cls.defineAccessor(
                "info",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<Shader *>(info.This()->GetAlignedPointerFromInternalField(0));
                    info.GetReturnValue().Set(cobj->info());
                });
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