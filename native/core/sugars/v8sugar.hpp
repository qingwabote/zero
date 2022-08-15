#pragma once

#include "v8.h"

namespace sugar
{
    typedef std::unique_ptr<v8::Isolate, void (*)(v8::Isolate *)> unique_isolate;
    unique_isolate v8_initWithIsolate();

    std::string v8_stackTrace_toString(v8::Local<v8::StackTrace> stack);

    void v8_isolate_promiseRejectCallback(v8::PromiseRejectMessage msg);

    v8::MaybeLocal<v8::Module> v8_module_load(
        v8::Local<v8::Context> context,
        v8::Local<v8::String> specifier,
        v8::Local<v8::FixedArray> import_assertions = v8::Local<v8::FixedArray>(),
        v8::Local<v8::Module> referrer = v8::Local<v8::Module>());

    template <class S>
    v8::Local<S> v8_object_get(v8::Local<v8::Context> context, v8::Local<v8::Object> object, const char *name)
    {
        v8::EscapableHandleScope handleScope(context->GetIsolate());

        v8::Local<v8::String> key = v8::String::NewFromUtf8(context->GetIsolate(), name).ToLocalChecked();
        v8::Maybe<bool> maybeExist = object->Has(context, key);
        if (maybeExist.IsNothing())
        {
            return {};
        }
        if (!maybeExist.FromJust())
        {
            return {};
        }
        v8::MaybeLocal<v8::Value> maybeValue = object->Get(context, key);
        if (maybeValue.IsEmpty())
        {
            return {};
        }
        return handleScope.Escape(maybeValue.ToLocalChecked().As<S>());
    }

    template <class S>
    void v8_object_set(v8::Local<v8::Context> context, v8::Local<v8::Object> object, const char *name, v8::Local<S> value)
    {
        v8::EscapableHandleScope handleScope(context->GetIsolate());

        v8::Local<v8::String> key = v8::String::NewFromUtf8(context->GetIsolate(), name).ToLocalChecked();
        v8::Maybe<bool> ok = object->Set(context, key, value);
        if (ok.IsNothing())
        {
            throw "v8_object_set failed";
        }
    }

    void v8_gc(v8::Local<v8::Context> context);
}