#include "bindings/gfx/device.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::Object> device(v8::Local<v8::Context> context)
        {
            v8::EscapableHandleScope scope(context->GetIsolate());

            v8::Local<v8::Object> device = v8::Object::New(context->GetIsolate());

            // device->Set(
            //     context,
            //     v8::String::NewFromUtf8Literal(context->GetIsolate(), "log"),
            //     v8::FunctionTemplate::New(
            //         context->GetIsolate(),
            //         [](const v8::FunctionCallbackInfo<v8::Value> &args)
            //         {
            //             auto isolate = args.GetIsolate();
            //             auto context = isolate->GetCurrentContext();
            //             v8::HandleScope scope(isolate);

            //             v8::Local<v8::Array> array = v8::Array::New(isolate, args.Length());
            //             for (int i = 0; i < args.Length(); i++)
            //             {
            //                 array->Set(context, i, args[i]);
            //             }

            //             auto join = sugar::v8_object_get<v8::Function>(context, array, "join");
            //             v8::Local<v8::Value> a[] = {v8::String::NewFromUtf8Literal(isolate, " ")};
            //             auto res = join->Call(context, array, 1, a).ToLocalChecked().As<v8::String>();
            //             printf("%s\n", *v8::String::Utf8Value(isolate, res));
            //         })
            //         ->GetFunction(context)
            //         .ToLocalChecked());

            return scope.Escape(device);
        }
    }
}