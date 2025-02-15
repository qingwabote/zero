#include <v8.h>
#include <yoga/YGNode.h>

void puttyknife_yoga_callbacks(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
{
    auto isolate = context->GetIsolate();
    v8::HandleScope scope(isolate);

    exports_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "YGNodeSetDirtiedFunc_PK"),
                     v8::FunctionTemplate::New(isolate,
                                               [](const v8::FunctionCallbackInfo<v8::Value> &info)
                                               {
                                                   auto isolate = info.GetIsolate();
                                                   v8::HandleScope scope(isolate);

                                                   auto context = isolate->GetCurrentContext();

                                                   uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                                                   YGNode *node = reinterpret_cast<YGNode *>(address);

                                                   auto f = info[1].As<v8::Function>();

                                                   v8::Global<v8::Function> *fn = new v8::Global<v8::Function>(isolate, f);

                                                   YGNodeSetContext(node, fn);
                                                   YGNodeSetDirtiedFunc(node,
                                                                        [](YGNodeConstRef node)
                                                                        {
                                                                            auto isolate = v8::Isolate::GetCurrent();
                                                                            v8::HandleScope scope(isolate);

                                                                            auto context = isolate->GetCurrentContext();

                                                                            uint64_t args[] = {reinterpret_cast<uint64_t>(node)};

                                                                            v8::Local<v8::Value> js_args[] = {v8::BigInt::NewFromUnsigned(isolate, reinterpret_cast<uint64_t>(args))};

                                                                            auto fn = reinterpret_cast<v8::Global<v8::Function> *>(YGNodeGetContext(node));
                                                                            fn->Get(isolate)->Call(context, context->Global(), 1, js_args);
                                                                        });
                                               })
                         ->GetFunction(context)
                         .ToLocalChecked());
}