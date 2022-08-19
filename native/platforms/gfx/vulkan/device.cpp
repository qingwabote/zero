#include "bindings/gfx/device.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        void device_constructor(const v8::FunctionCallbackInfo<v8::Value> &info)
        {
            v8::Isolate *isolate = info.GetIsolate();

            // info.This()->Set(
            //     isolate->GetCurrentContext(),
            //     v8::String::NewFromUtf8Literal(isolate, "commandBuffer"),

            // )
        }
    }
}