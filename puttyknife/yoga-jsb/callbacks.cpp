#include <v8.h>
#include <yoga/YGNode.h>
#include "NodeContext.hpp"

namespace puttyknife::yoga
{
    void callbacks(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
    {
        auto isolate = context->GetIsolate();
        v8::HandleScope scope(isolate);

        exports_obj->Set(
            context,
            v8::String::NewFromUtf8Literal(isolate, "YGNodeSetDirtiedFunc_PK"),
            v8::FunctionTemplate::New(
                isolate,
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto isolate = info.GetIsolate();
                    v8::HandleScope scope(isolate);

                    auto context = isolate->GetCurrentContext();

                    uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                    YGNode *node = reinterpret_cast<YGNode *>(address);

                    reinterpret_cast<NodeContext *>(YGNodeGetContext(node))->dirtiedFunc.Reset(isolate, info[1].As<v8::Function>());
                    YGNodeSetDirtiedFunc(
                        node,
                        [](YGNodeConstRef node)
                        {
                            auto isolate = v8::Isolate::GetCurrent();
                            v8::HandleScope scope(isolate);

                            auto context = isolate->GetCurrentContext();

                            v8::Local<v8::Value> args[] = {v8::BigInt::NewFromUnsigned(isolate, reinterpret_cast<uint64_t>(node))};

                            auto arr = v8::Array::New(isolate, args, std::size(args)).As<v8::Value>();

                            auto &fn = reinterpret_cast<NodeContext *>(YGNodeGetContext(node))->dirtiedFunc;
                            fn.Get(isolate)->Call(context, context->Global(), 1, &arr);
                        });
                })
                ->GetFunction(context)
                .ToLocalChecked());

        exports_obj->Set(
            context,
            v8::String::NewFromUtf8Literal(isolate, "YGNodeSetMeasureFunc_PK"),
            v8::FunctionTemplate::New(
                isolate,
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto isolate = info.GetIsolate();
                    v8::HandleScope scope(isolate);

                    auto context = isolate->GetCurrentContext();

                    uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                    YGNode *node = reinterpret_cast<YGNode *>(address);

                    reinterpret_cast<NodeContext *>(YGNodeGetContext(node))->measureFunc.Reset(isolate, info[1].As<v8::Function>());
                    YGNodeSetMeasureFunc(
                        node,
                        [](YGNodeConstRef node, float width, YGMeasureMode widthMode, float height, YGMeasureMode heightMode)
                        {
                            auto isolate = v8::Isolate::GetCurrent();
                            v8::HandleScope scope(isolate);

                            auto context = isolate->GetCurrentContext();

                            YGSize size{};

                            v8::Local<v8::Value> args[] = {
                                v8::BigInt::NewFromUnsigned(isolate, reinterpret_cast<uint64_t>(&size)),
                                v8::BigInt::NewFromUnsigned(isolate, reinterpret_cast<uint64_t>(node)),
                                v8::Number::New(isolate, width),
                                v8::Number::New(isolate, widthMode),
                                v8::Number::New(isolate, height),
                                v8::Number::New(isolate, heightMode),
                            };

                            auto arr = v8::Array::New(isolate, args, std::size(args)).As<v8::Value>();

                            auto &fn = reinterpret_cast<NodeContext *>(YGNodeGetContext(node))->measureFunc;
                            fn.Get(isolate)->Call(context, context->Global(), 1, &arr);

                            return size;
                        });
                })
                ->GetFunction(context)
                .ToLocalChecked());
    }
}