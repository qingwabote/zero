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

            new sugar::v8::SetWeakCallback<v8::Object>(
                isolate,
                info.This(),
                []()
                {
                    printf("SetWeakCallback");
                });
        }

        void device_initialize(const v8::FunctionCallbackInfo<v8::Value> &info)
        {
            // if (volkInitialize())
            // {
            //     info.GetReturnValue().Set(true);
            //     return;
            // }

            // uint32_t apiVersion = VK_API_VERSION_1_0;
            // vkEnumerateInstanceVersion(&apiVersion);

            v8::Isolate *isolate = info.GetIsolate();
            auto context = isolate->GetCurrentContext();

            info.GetReturnValue().Set(false);
        }
    }
}