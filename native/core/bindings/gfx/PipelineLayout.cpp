#include "PipelineLayout.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> PipelineLayout::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"PipelineLayout"};
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<PipelineLayout>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(info[0].As<v8::Array>()));
                });

            return scope.Escape(cls.flush());
        }
    }
}