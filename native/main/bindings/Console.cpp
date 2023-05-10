#include "Console.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    v8::Local<v8::FunctionTemplate> Console::createTemplate()
    {
        sugar::v8::Class cls{"Console"};
        cls.defineFunction(
            "log",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto isolate = info.GetIsolate();
                v8::HandleScope scope(isolate);

                auto context = isolate->GetCurrentContext();

                v8::Local<v8::Array> array = v8::Array::New(isolate, info.Length());
                for (int i = 0; i < info.Length(); i++)
                {
                    array->Set(context, i, info[i]).ToChecked();
                }

                auto join = sugar::v8::object_get(array, "join").As<v8::Function>();
                v8::Local<v8::Value> a[] = {v8::String::NewFromUtf8Literal(isolate, " ")};
                auto res = join->Call(context, array, 1, a).ToLocalChecked().As<v8::String>();
                printf("%s\n", *v8::String::Utf8Value(isolate, res));
            });
        return cls.flush();
    }
}