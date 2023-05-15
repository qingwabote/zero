#include "Fence.hpp"

namespace binding::gfx
{
    v8::Local<v8::FunctionTemplate> Fence::createTemplate()
    {
        v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

        auto ctor = Binding::createTemplate();

        sugar::v8::ctor_name(ctor, "Fence");
        sugar::v8::ctor_function(
            ctor,
            "initialize",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Fence>(info.This());
                bool signaled = false;
                if (info.Length() > 0)
                {
                    signaled = info[1].As<v8::Boolean>()->Value();
                }
                info.GetReturnValue().Set(c_obj->initialize(signaled));
            });
        return scope.Escape(ctor);
    }
}
