#include "bindings/gfx/commandbuffer.hpp"

namespace binding
{
    namespace gfx
    {
        void commandbuffer_constructor(const v8::FunctionCallbackInfo<v8::Value> &info) {}

        void commandbuffer_beginRenderPass(const v8::FunctionCallbackInfo<v8::Value> &info)
        {
            // info.Holder()
            v8::Isolate *isolate = info.GetIsolate();
            auto context = isolate->GetCurrentContext();
            v8::HandleScope scope(isolate);
        }
    }
}
