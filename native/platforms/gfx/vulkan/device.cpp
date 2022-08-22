#include "bindings/gfx/device.hpp"
#include "bindings/gfx/commandbuffer.hpp"
#include "VkBootstrap.h"

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

            vkb::InstanceBuilder builder;
            auto inst_ret = builder
                                .set_app_name("_app_name")
                                .request_validation_layers(true)
                                .require_api_version(1, 1, 0)
                                .build();
            if (!inst_ret)
            {
                printf("Failed to create Vulkan instance. Error: %s\n", inst_ret.error().message().c_str());
                info.GetReturnValue().Set(true);
                return;
            }
            v8::Isolate *isolate = info.GetIsolate();
            auto context = isolate->GetCurrentContext();

            info.GetReturnValue().Set(false);
        }
    }
}