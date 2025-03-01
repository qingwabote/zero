#include <v8.h>
#include <phys/World.hpp>

using namespace phys;
namespace puttyknife::phys
{
    void callbacks(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
    {
        auto isolate = context->GetIsolate();
        v8::HandleScope scope(isolate);

        exports_obj->Set(
            context,
            v8::String::NewFromUtf8Literal(isolate, "physWorld_setDebugDrawer_PK"),
            v8::FunctionTemplate::New(
                isolate,
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto isolate = info.GetIsolate();
                    v8::HandleScope scope(isolate);

                    auto context = isolate->GetCurrentContext();

                    uint64_t address = info[0].As<v8::BigInt>()->Uint64Value();
                    World *world = reinterpret_cast<World *>(address);

                    auto fn = std::make_shared<v8::Global<v8::Function>>(isolate, info[1].As<v8::Function>());

                    physWorld_setDebugDrawer(
                        world,
                        [fn](const Vector3 &from, const Vector3 &to, const Vector3 &color)
                        {
                            auto isolate = v8::Isolate::GetCurrent();
                            v8::HandleScope scope(isolate);

                            auto context = isolate->GetCurrentContext();

                            v8::Local<v8::Value> args[] = {
                                v8::BigInt::NewFromUnsigned(isolate, reinterpret_cast<uint64_t>(&from)),
                                v8::BigInt::NewFromUnsigned(isolate, reinterpret_cast<uint64_t>(&to)),
                                v8::BigInt::NewFromUnsigned(isolate, reinterpret_cast<uint64_t>(&color))};

                            auto arr = v8::Array::New(isolate, args, std::size(args)).As<v8::Value>();
                            fn->Get(isolate)->Call(context, context->Global(), 1, &arr);
                        });
                })
                ->GetFunction(context)
                .ToLocalChecked());
    }
}