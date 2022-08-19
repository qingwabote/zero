#pragma once

#include "sugars/v8sugar.hpp"
#include "commandbuffer.hpp"

namespace binding
{
    namespace gfx
    {
        void device_constructor(const v8::FunctionCallbackInfo<v8::Value> &info);

        inline v8::Local<v8::FunctionTemplate> device(v8::Isolate *isolate)
        {
            auto cache = sugar::v8_isolate_getConstructorCache(isolate);
            auto it = cache->find("gfx.device");
            if (it != cache->end())
            {
                return it->second.Get(isolate);
            }

            v8::EscapableHandleScope scope(isolate);

            v8::Local<v8::FunctionTemplate> constructor{v8::FunctionTemplate::New(isolate, device_constructor)};
            constructor->SetClassName(v8::String::NewFromUtf8Literal(isolate, "Device"));
            // constructor->InstanceTemplate()->SetInternalFieldCount(1);

            // commandbuffer(context)->InstanceTemplate()->NewInstance(context).ToLocalChecked();

            // auto prototype = constructor->PrototypeTemplate();
            // prototype->Set(
            //     v8::String::NewFromUtf8Literal(context->GetIsolate(), "commandBuffer"),
            //     commandbuffer(context)->InstanceTemplate());

            cache->emplace("gfx.device", v8::Global<v8::FunctionTemplate>{isolate, constructor});

            return scope.Escape(constructor);
        }
    }
}