#include "console.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    void console_constructor(const v8::FunctionCallbackInfo<v8::Value> &info) {}

    void console_log(const v8::FunctionCallbackInfo<v8::Value> &info)
    {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        v8::HandleScope scope(isolate);

        v8::Local<v8::Array> array = v8::Array::New(isolate, info.Length());
        for (int i = 0; i < info.Length(); i++)
        {
            array->Set(context, i, info[i]);
        }

        auto join = sugar::v8_object_get<v8::Function>(context, array, "join");
        v8::Local<v8::Value> a[] = {v8::String::NewFromUtf8Literal(isolate, " ")};
        auto res = join->Call(context, array, 1, a).ToLocalChecked().As<v8::String>();
        printf("%s\n", *v8::String::Utf8Value(isolate, res));
    }
}