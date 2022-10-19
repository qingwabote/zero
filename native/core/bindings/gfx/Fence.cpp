#include "Fence.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Fence::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"Fence"};
            cls.defineFunction(
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
            return scope.Escape(cls.flush());
        }
    }
}