#include <puttyknife/runtime.hpp>

namespace puttyknife
{
    void Runtime(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
    {
        auto isolate = context->GetIsolate();

        exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "addBuffer"),
                         v8::FunctionTemplate::New(isolate,
                                                   [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                                   {
                                                       auto isolate = info.GetIsolate();
                                                       v8::HandleScope scope(isolate);

                                                       auto context = isolate->GetCurrentContext();

                                                       v8::Local<v8::ArrayBufferView> view = info[0].As<v8::ArrayBufferView>();
                                                       void *ptr = reinterpret_cast<uint8_t *>(view->Buffer()->Data()) + view->ByteOffset();
                                                       uint64_t address = reinterpret_cast<uint64_t>(ptr);
                                                       info.GetReturnValue().Set(v8::BigInt::NewFromUnsigned(isolate, address));
                                                   })
                             ->GetFunction(context)
                             .ToLocalChecked());
        exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "getBuffer"),
                         v8::FunctionTemplate::New(isolate,
                                                   [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                                   {
                                                       auto isolate = info.GetIsolate();
                                                       v8::HandleScope scope(isolate);

                                                       auto context = isolate->GetCurrentContext();

                                                       uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                                                       v8::String::Utf8Value type(isolate, info[1]);
                                                       uint32_t elements = info[2].As<v8::Number>()->Uint32Value(context).ToChecked();

                                                       v8::Local<v8::TypedArray> array;
                                                       if (strcmp(*type, "u16") == 0)
                                                       {
                                                           size_t size = elements * 2;
                                                           auto store = v8::ArrayBuffer::NewBackingStore(reinterpret_cast<void *>(address), size, v8::BackingStore::EmptyDeleter, nullptr);
                                                           array = v8::Uint16Array::New(v8::ArrayBuffer::New(isolate, std::move(store)), 0, elements);
                                                       }
                                                       else if (strcmp(*type, "f32") == 0)
                                                       {
                                                           size_t size = elements * 4;
                                                           auto store = v8::ArrayBuffer::NewBackingStore(reinterpret_cast<void *>(address), size, v8::BackingStore::EmptyDeleter, nullptr);
                                                           array = v8::Float32Array::New(v8::ArrayBuffer::New(isolate, std::move(store)), 0, elements);
                                                       }
                                                       else
                                                       {
                                                           std::string msg{"unsupported type: \"" + std::string(*type) + "\""};
                                                           isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
                                                       }
                                                       info.GetReturnValue().Set(array);
                                                   })
                             ->GetFunction(context)
                             .ToLocalChecked());
        exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "delBuffer"),
                         v8::FunctionTemplate::New(isolate,
                                                   [](const v8::FunctionCallbackInfo<v8::Value> &info) {})
                             ->GetFunction(context)
                             .ToLocalChecked());

        exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "addString"),
                         v8::FunctionTemplate::New(isolate,
                                                   [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                                   {
                                                       auto isolate = info.GetIsolate();
                                                       v8::HandleScope scope(isolate);

                                                       auto context = isolate->GetCurrentContext();

                                                       auto str = info[0].As<v8::String>();
                                                       size_t len = str->Utf8Length(isolate);

                                                       char *ptr = reinterpret_cast<char *>(malloc(len + 1));
                                                       if (ptr)
                                                       {
                                                           str->WriteUtf8(isolate, ptr);
                                                           ptr[len] = 0;
                                                       }

                                                       uint64_t address = reinterpret_cast<uint64_t>(ptr);
                                                       info.GetReturnValue().Set(v8::BigInt::NewFromUnsigned(isolate, address));
                                                   })
                             ->GetFunction(context)
                             .ToLocalChecked());
        exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "getString"),
                         v8::FunctionTemplate::New(isolate,
                                                   [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                                   {
                                                       auto isolate = info.GetIsolate();
                                                       v8::HandleScope scope(isolate);

                                                       auto context = isolate->GetCurrentContext();

                                                       uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();

                                                       info.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, reinterpret_cast<char *>(address)).ToLocalChecked());
                                                   })
                             ->GetFunction(context)
                             .ToLocalChecked());
        exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "delString"),
                         v8::FunctionTemplate::New(isolate,
                                                   [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                                   {
                                                       auto isolate = info.GetIsolate();
                                                       v8::HandleScope scope(isolate);

                                                       auto context = isolate->GetCurrentContext();

                                                       uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                                                       void *ptr = reinterpret_cast<void *>(address);
                                                       free(ptr);
                                                   })
                             ->GetFunction(context)
                             .ToLocalChecked());

        exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "addFunction"),
                         v8::FunctionTemplate::New(isolate,
                                                   [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                                   {
                                                       info.GetReturnValue().Set(info[0]);
                                                   })
                             ->GetFunction(context)
                             .ToLocalChecked());

        exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "getArgs"),
                         v8::FunctionTemplate::New(isolate,
                                                   [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                                   {
                                                       auto isolate = info.GetIsolate();
                                                       v8::HandleScope scope(isolate);

                                                       auto context = isolate->GetCurrentContext();

                                                       info.GetReturnValue().Set(info[0]);
                                                   })
                             ->GetFunction(context)
                             .ToLocalChecked());

        exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "objAtArr"),
                         v8::FunctionTemplate::New(isolate,
                                                   [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                                   {
                                                       auto isolate = info.GetIsolate();
                                                       v8::HandleScope scope(isolate);

                                                       auto context = isolate->GetCurrentContext();

                                                       uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                                                       uint32_t n = info[1].As<v8::Number>()->Uint32Value(context).ToChecked();

                                                       uint64_t *ptr = reinterpret_cast<uint64_t *>(address);
                                                       info.GetReturnValue().Set(v8::BigInt::NewFromUnsigned(isolate, *(ptr + n)));
                                                   })
                             ->GetFunction(context)
                             .ToLocalChecked());
    }
}