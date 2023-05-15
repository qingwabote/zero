#include "Pipeline.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Pipeline::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            auto ctor = Binding::createTemplate();

            sugar::v8::ctor_name(ctor, "Pipeline");
            sugar::v8::ctor_function(
                ctor,
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Pipeline>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(c_obj->retain(info[0]).As<v8::Object>()));
                });

            return scope.Escape(ctor);
        }
    }
}