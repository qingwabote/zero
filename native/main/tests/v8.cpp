#include "v8.hpp"
#include "v8/v8.h"
#include "v8/libplatform/libplatform.h"
#include "log.h"

namespace _v8 = v8;
namespace test::v8
{
    void backingStore()
    {
        std::unique_ptr<_v8::Platform> platform = _v8::platform::NewDefaultPlatform();
        _v8::V8::InitializePlatform(platform.get());
        _v8::V8::SetFlagsFromString("--expose-gc-as=__gc__");
        _v8::V8::Initialize();

        _v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator_shared = std::shared_ptr<_v8::ArrayBuffer::Allocator>{_v8::ArrayBuffer::Allocator::NewDefaultAllocator()};
        _v8::Isolate *isolate = _v8::Isolate::New(create_params);

        _v8::Isolate::Scope isolate_scope(isolate);
        _v8::HandleScope handle_scope(isolate);
        _v8::Local<_v8::Context> context = _v8::Context::New(isolate);
        _v8::Context::Scope context_scope(context);

        {
            _v8::HandleScope handle_scope(isolate);

            auto store = _v8::ArrayBuffer::NewBackingStore(isolate, 128);
            auto array = _v8::ArrayBuffer::New(isolate, std::move(store));
            ZERO_LOG("dsfsdf");
        }

        auto gc = context->Global()->Get(context, _v8::String::NewFromUtf8Literal(isolate, "__gc__")).ToLocalChecked().As<_v8::Function>();
        gc->Call(context, context->Global(), 0, nullptr).ToLocalChecked();

        ZERO_LOG("dsfsdf");
    }
}