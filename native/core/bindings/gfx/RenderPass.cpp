#include "RenderPass.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> RenderPass::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"RenderPass"};
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<RenderPass>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(info[0].As<v8::Object>()));
                });
            return scope.Escape(cls.flush());
        }
    }
}