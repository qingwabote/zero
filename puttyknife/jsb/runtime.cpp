#include <puttyknife/runtime.hpp>
#include "malloc.h"

namespace puttyknife
{
    void Runtime(v8::Local<v8::Context> context)
    {
        auto isolate = context->GetIsolate();
        v8::HandleScope scope(isolate);

        auto cls = v8::FunctionTemplate::New(isolate);
        auto proto = cls->PrototypeTemplate();
        proto->Set(isolate, "newBuffer",
                   v8::FunctionTemplate::New(isolate, [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                             {
                                                    auto isolate = info.GetIsolate();
                                                    v8::HandleScope scope(isolate);

                                                    auto context = isolate->GetCurrentContext();

                                                    uint32_t bytes = info[0].As<v8::Number>()->Uint32Value(context).ToChecked();
                                                    uint32_t alignment = info[1].As<v8::Number>()->Uint32Value(context).ToChecked();

                                                    void *ptr = nullptr;
                                                    if (alignment)
                                                    {
                                                        ptr = sted::aligned_alloc(alignment, bytes);
                                                    }
                                                    else
                                                    {
                                                        ptr = sted::malloc(bytes);
                                                    }

                                                    uint64_t address = reinterpret_cast<uint64_t>(ptr);
                                                    info.GetReturnValue().Set(v8::BigInt::NewFromUnsigned(isolate, address)); }));
        proto->Set(isolate, "addBuffer",
                   v8::FunctionTemplate::New(isolate,
                                             [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                             {
                                                 auto isolate = info.GetIsolate();
                                                 v8::HandleScope scope(isolate);

                                                 auto context = isolate->GetCurrentContext();

                                                 v8::Local<v8::ArrayBufferView> view = info[0].As<v8::ArrayBufferView>();
                                                 uint32_t alignment = info[1].As<v8::Number>()->Uint32Value(context).ToChecked();

                                                 void *ptr = nullptr;
                                                 if (alignment)
                                                 {
                                                     ptr = sted::aligned_alloc(alignment, view->ByteLength());
                                                 }
                                                 else
                                                 {
                                                     ptr = sted::malloc(view->ByteLength());
                                                 }

                                                 view->CopyContents(ptr, view->ByteLength());
                                                 uint64_t address = reinterpret_cast<uint64_t>(ptr);
                                                 info.GetReturnValue().Set(v8::BigInt::NewFromUnsigned(isolate, address));
                                             }));
        proto->Set(isolate, "locBuffer",
                   v8::FunctionTemplate::New(isolate,
                                             [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                             {
                                                 auto isolate = info.GetIsolate();
                                                 v8::HandleScope scope(isolate);

                                                 auto context = isolate->GetCurrentContext();

                                                 uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                                                 int32_t offset = info[1].As<v8::Number>()->Int32Value(context).ToChecked();
                                                 info.GetReturnValue().Set(v8::BigInt::NewFromUnsigned(isolate, address + offset));
                                             }));
        proto->Set(isolate, "getBuffer",
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
                                                 if (strcmp(*type, "u8") == 0)
                                                 {
                                                     size_t size = elements;
                                                     auto store = v8::ArrayBuffer::NewBackingStore(reinterpret_cast<void *>(address), size, v8::BackingStore::EmptyDeleter, nullptr);
                                                     array = v8::Uint8Array::New(v8::ArrayBuffer::New(isolate, std::move(store)), 0, elements);
                                                 }
                                                 else if (strcmp(*type, "u16") == 0)
                                                 {
                                                     size_t size = elements * 2;
                                                     auto store = v8::ArrayBuffer::NewBackingStore(reinterpret_cast<void *>(address), size, v8::BackingStore::EmptyDeleter, nullptr);
                                                     array = v8::Uint16Array::New(v8::ArrayBuffer::New(isolate, std::move(store)), 0, elements);
                                                 }
                                                 else if (strcmp(*type, "u32") == 0)
                                                 {
                                                     size_t size = elements * 4;
                                                     auto store = v8::ArrayBuffer::NewBackingStore(reinterpret_cast<void *>(address), size, v8::BackingStore::EmptyDeleter, nullptr);
                                                     array = v8::Uint32Array::New(v8::ArrayBuffer::New(isolate, std::move(store)), 0, elements);
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
                                             }));
        proto->Set(isolate, "cpyBuffer",
                   v8::FunctionTemplate::New(isolate,
                                             [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                             {
                                                 auto isolate = info.GetIsolate();
                                                 v8::HandleScope scope(isolate);

                                                 auto context = isolate->GetCurrentContext();

                                                 v8::Local<v8::Array> out = info[0].As<v8::Array>();
                                                 uint64_t address = info[1].As<v8::BigInt>()->Uint64Value();
                                                 v8::String::Utf8Value type(isolate, info[2]);
                                                 uint32_t elements = info[3].As<v8::Number>()->Uint32Value(context).ToChecked();

                                                 if (strcmp(*type, "u16") == 0)
                                                 {
                                                     uint16_t *p = reinterpret_cast<uint16_t *>(address);
                                                     for (uint32_t i = 0; i < elements; i++)
                                                     {
                                                         out->Set(context, i, v8::Number::New(isolate, *(p + i)));
                                                     }
                                                 }
                                                 else if (strcmp(*type, "f32") == 0)
                                                 {
                                                     float *p = reinterpret_cast<float *>(address);
                                                     for (uint32_t i = 0; i < elements; i++)
                                                     {
                                                         out->Set(context, i, v8::Number::New(isolate, *(p + i)));
                                                     }
                                                 }
                                                 else
                                                 {
                                                     std::string msg{"unsupported type: \"" + std::string(*type) + "\""};
                                                     isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str()).ToLocalChecked()));
                                                 }
                                                 info.GetReturnValue().Set(out);
                                             }));
        proto->Set(isolate, "delBuffer",
                   v8::FunctionTemplate::New(isolate,
                                             [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                             {
                                                 uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                                                 void *ptr = reinterpret_cast<void *>(address);
                                                 sted::free(ptr);
                                             }));

        proto->Set(isolate, "addString",
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
                                             }));
        proto->Set(isolate, "getString",
                   v8::FunctionTemplate::New(isolate,
                                             [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                             {
                                                 auto isolate = info.GetIsolate();
                                                 v8::HandleScope scope(isolate);

                                                 auto context = isolate->GetCurrentContext();

                                                 uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();

                                                 info.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, reinterpret_cast<char *>(address)).ToLocalChecked());
                                             }));
        proto->Set(isolate, "delString",
                   v8::FunctionTemplate::New(isolate,
                                             [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                             {
                                                 uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                                                 void *ptr = reinterpret_cast<void *>(address);
                                                 free(ptr);
                                             }));

        proto->Set(isolate, "addFunction",
                   v8::FunctionTemplate::New(isolate,
                                             [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                             {
                                                 info.GetReturnValue().Set(info[0]);
                                             }));

        proto->Set(isolate, "getArgs",
                   v8::FunctionTemplate::New(isolate,
                                             [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                             {
                                                 auto isolate = info.GetIsolate();
                                                 v8::HandleScope scope(isolate);

                                                 auto context = isolate->GetCurrentContext();

                                                 info.GetReturnValue().Set(info[0]);
                                             }));

        proto->Set(isolate, "objAtArr",
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
                                             }));

        auto ns_name = v8::String::NewFromUtf8Literal(isolate, "puttyknife");
        v8::Local<v8::Object> ns_obj;
        if (context->Global()->Has(context, ns_name).FromJust())
        {
            ns_obj = context->Global()->Get(context, ns_name).ToLocalChecked().As<v8::Object>();
        }
        else
        {
            ns_obj = v8::Object::New(isolate);
            context->Global()->Set(context, ns_name, ns_obj);
        }
        ns_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "Runtime"), cls->GetFunction(context).ToLocalChecked());
    }
}