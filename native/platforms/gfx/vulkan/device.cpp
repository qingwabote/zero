#include "bindings/gfx/device.hpp"
#include "bindings/gfx/commandbuffer.hpp"

namespace binding
{
    namespace gfx
    {
        void device_constructor(const v8::FunctionCallbackInfo<v8::Value> &info)
        {
            v8::Isolate *isolate = info.GetIsolate();
            auto context = isolate->GetCurrentContext();

            info.This()->Set(
                context,
                v8::String::NewFromUtf8Literal(isolate, "commandBuffer"),
                commandbuffer(isolate)->GetFunction(context).ToLocalChecked()->NewInstance(context).ToLocalChecked());
        }
    }
}