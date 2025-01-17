#include "text.hpp"

void text_initialize(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
{
    auto isolate = context->GetIsolate();

    exports_obj->Set(
        context,
        v8::String::NewFromUtf8Literal(isolate, "textEncode"),
        v8::FunctionTemplate::New(
            isolate,
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto isolate = info.GetIsolate();
                v8::HandleScope scope(isolate);

                auto context = isolate->GetCurrentContext();

                v8::Local<v8::String> src = info[0].As<v8::String>();
                v8::Local<v8::ArrayBufferView> des = info[1].As<v8::ArrayBufferView>();
                int written = src->WriteUtf8(isolate, reinterpret_cast<char *>(des->Buffer()->Data()) + des->ByteOffset(), -1, nullptr, v8::String::WriteOptions::NO_NULL_TERMINATION);
                info.GetReturnValue().Set(written);
            })
            ->GetFunction(context)
            .ToLocalChecked());

    exports_obj->Set(
        context,
        v8::String::NewFromUtf8Literal(isolate, "textDecode"),
        v8::FunctionTemplate::New(
            isolate,
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto isolate = info.GetIsolate();
                v8::HandleScope scope(isolate);

                auto context = isolate->GetCurrentContext();

                v8::Local<v8::ArrayBufferView> buffer = info[0].As<v8::ArrayBufferView>();
                v8::Local<v8::String> text = v8::String::NewFromUtf8(isolate, reinterpret_cast<char *>(buffer->Buffer()->Data()) + buffer->ByteOffset(), v8::NewStringType::kNormal, buffer->ByteLength()).ToLocalChecked();
                info.GetReturnValue().Set(text);
            })
            ->GetFunction(context)
            .ToLocalChecked());
}