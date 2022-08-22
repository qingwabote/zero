#include "bindings/gfx/device.hpp"

namespace binding
{
    namespace gfx
    {
        void device_constructor(const v8::FunctionCallbackInfo<v8::Value> &info)
        {
            v8::Isolate *isolate = info.GetIsolate();
            auto context = isolate->GetCurrentContext();

            SDL_Window *window = static_cast<SDL_Window *>(info[0].As<v8::External>()->Value());
            info.This()->SetAlignedPointerInInternalField(0, sugar::v8::bind(isolate, new Device(window), info.This()));
            // info.This()->Set(
            //     context,
            //     v8::String::NewFromUtf8Literal(isolate, "commandBuffer"),
            //     commandbuffer(isolate)->GetFunction(context).ToLocalChecked()->NewInstance(context).ToLocalChecked());
        }

        void device_initialize(const v8::FunctionCallbackInfo<v8::Value> &info)
        {
            // vkb::InstanceBuilder builder;
            // auto inst_ret = builder
            //                     .set_app_name("_app_name")
            //                     .request_validation_layers(true)
            //                     .require_api_version(1, 1, 0)
            //                     .use_default_debug_messenger()
            //                     .build();
            // if (!inst_ret)
            // {
            //     printf("Failed to create Vulkan instance. Error: %s\n", inst_ret.error().message().c_str());
            //     info.GetReturnValue().Set(true);
            //     return;
            // }
            v8::Isolate *isolate = info.GetIsolate();
            auto context = isolate->GetCurrentContext();

            info.GetReturnValue().Set(false);
        }

        v8::Local<v8::FunctionTemplate> Device::constructor(v8::Isolate *isolate)
        {
            auto cache = sugar::v8::isolate_getConstructorCache(isolate);
            auto it = cache->find("gfx.device");
            if (it != cache->end())
            {
                return it->second.Get(isolate);
            }

            v8::EscapableHandleScope scope(isolate);

            v8::Local<v8::FunctionTemplate> constructor{v8::FunctionTemplate::New(isolate, device_constructor)};
            constructor->SetClassName(v8::String::NewFromUtf8Literal(isolate, "Device"));
            constructor->InstanceTemplate()->SetInternalFieldCount(1);

            auto prototype = constructor->PrototypeTemplate();
            prototype->Set(isolate, "initialize", v8::FunctionTemplate::New(isolate, device_initialize));

            cache->emplace("gfx.device", v8::Global<v8::FunctionTemplate>{isolate, constructor});

            return scope.Escape(constructor);
        }
    }
}