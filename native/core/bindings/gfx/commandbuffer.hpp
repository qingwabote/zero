#pragma once

#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        void commandbuffer_constructor(const v8::FunctionCallbackInfo<v8::Value> &info);

        void commandbuffer_beginRenderPass(const v8::FunctionCallbackInfo<v8::Value> &info);

        inline v8::Local<v8::FunctionTemplate> commandbuffer(v8::Isolate *isolate)
        {
            auto cache = sugar::v8_isolate_getConstructorCache(isolate);
            auto it = cache->find("gfx.commandbuffer");
            if (it != cache->end())
            {
                return it->second.Get(isolate);
            }

            v8::EscapableHandleScope scope(isolate);

            v8::Local<v8::FunctionTemplate> constructor{v8::FunctionTemplate::New(isolate, commandbuffer_constructor)};
            constructor->SetClassName(v8::String::NewFromUtf8Literal(isolate, "Device"));
            // constructor->InstanceTemplate()->SetInternalFieldCount(1);

            auto prototype = constructor->PrototypeTemplate();

            prototype->Set(
                v8::String::NewFromUtf8Literal(isolate, "beginRenderPass"),
                v8::FunctionTemplate::New(isolate, commandbuffer_beginRenderPass));

            cache->emplace("gfx.commandbuffer", v8::Global<v8::FunctionTemplate>{isolate, constructor});

            return scope.Escape(constructor);
        }
    }
}