#include "Semaphore.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Semaphore::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"Semaphore"};
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Semaphore>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize());
                });
            return scope.Escape(cls.flush());
        }
    }
}