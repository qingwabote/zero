#include "Buffer.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Buffer::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"Buffer"};
            cls.defineAccessor(
                "info",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<Buffer *>(info.This()->GetAlignedPointerFromInternalField(0));
                    info.GetReturnValue().Set(cobj->info());
                });
            cls.defineFunction(
                "update",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<Buffer *>(info.This()->GetAlignedPointerFromInternalField(0));
                    cobj->update(info[0].As<v8::ArrayBufferView>());
                });
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<Buffer *>(info.This()->GetAlignedPointerFromInternalField(0));
                    info.GetReturnValue().Set(cobj->initialize(info[0].As<v8::Object>()));
                });

            return scope.Escape(cls.flush());
        }
    }
}