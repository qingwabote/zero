#pragma once

#include "sugars/v8sugar.hpp"

namespace binding
{
    void console_constructor(const v8::FunctionCallbackInfo<v8::Value> &info);

    void console_log(const v8::FunctionCallbackInfo<v8::Value> &info);

    inline v8::Local<v8::FunctionTemplate> console(v8::Isolate *isolate)
    {
        auto cache = sugar::v8_isolate_getConstructorCache(isolate);
        auto it = cache->find("console");
        if (it != cache->end())
        {
            return it->second.Get(isolate);
        }

        v8::EscapableHandleScope scope(isolate);

        v8::Local<v8::FunctionTemplate> constructor{v8::FunctionTemplate::New(isolate, console_constructor)};
        constructor->SetClassName(v8::String::NewFromUtf8Literal(isolate, "Console"));
        // constructor->InstanceTemplate()->SetInternalFieldCount(1);

        auto prototype = constructor->PrototypeTemplate();
        prototype->Set(
            v8::String::NewFromUtf8Literal(isolate, "log"),
            v8::FunctionTemplate::New(isolate, console_log));

        cache->emplace("console", v8::Global<v8::FunctionTemplate>{isolate, constructor});

        return scope.Escape(constructor);
    }
}