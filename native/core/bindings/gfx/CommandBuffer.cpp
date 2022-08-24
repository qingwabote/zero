#include "CommandBuffer.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> CommandBuffer::constructor(v8::Isolate *isolate)
        {
            auto cache = sugar::v8::isolate_getConstructorCache(isolate);
            auto it = cache->find("gfx.CommandBuffer");
            if (it != cache->end())
            {
                return it->second.Get(isolate);
            }

            v8::EscapableHandleScope scope(isolate);

            v8::Local<v8::FunctionTemplate> constructor{v8::FunctionTemplate::New(isolate, commandbuffer_constructor)};
            constructor->SetClassName(v8::String::NewFromUtf8Literal(isolate, "Device"));
            // constructor->InstanceTemplate()->SetInternalFieldCount(1);
            // constructor->InstanceTemplate()->SetCallAsFunctionHandler(commandbuffer_constructor);

            auto prototype = constructor->PrototypeTemplate();

            prototype->Set(
                v8::String::NewFromUtf8Literal(isolate, "beginRenderPass"),
                v8::FunctionTemplate::New(isolate, commandbuffer_beginRenderPass));

            cache->emplace("gfx.CommandBuffer", v8::Global<v8::FunctionTemplate>{isolate, constructor});

            return scope.Escape(constructor);
        }
    }
}