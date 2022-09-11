#include "CommandBuffer.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> CommandBuffer::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"CommandBuffer"};
            cls.defineFunction(
                "begin",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<CommandBuffer *>(info.This()->GetAlignedPointerFromInternalField(0));
                    cobj->begin();
                });
            cls.defineFunction(
                "beginRenderPass",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<CommandBuffer *>(info.This()->GetAlignedPointerFromInternalField(0));
                    cobj->beginRenderPass(info[0].As<v8::Object>());
                });

            return scope.Escape(cls.flush());
        }
    }
}