#pragma once

#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        void device_constructor(const v8::FunctionCallbackInfo<v8::Value> &info);

        void device_initialize(const v8::FunctionCallbackInfo<v8::Value> &info);

        inline v8::Local<v8::FunctionTemplate> device(v8::Isolate *isolate)
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
            // constructor->InstanceTemplate()->Set(isolate, "commandBuffer", commandbuffer(isolate)->InstanceTemplate());
            // constructor->InstanceTemplate()->SetInternalFieldCount(1);

            auto prototype = constructor->PrototypeTemplate();
            prototype->Set(isolate, "initialize", v8::FunctionTemplate::New(isolate, device_initialize));

            cache->emplace("gfx.device", v8::Global<v8::FunctionTemplate>{isolate, constructor});

            return scope.Escape(constructor);
        }
    }
}