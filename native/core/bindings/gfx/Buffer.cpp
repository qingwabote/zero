#include "Buffer.hpp"

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
                    auto c_obj = Binding::c_obj<Buffer>(info.This());
                    info.GetReturnValue().Set(c_obj->retrieve("info"));
                });

            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Buffer>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(c_obj->retain(info[0], "info").As<v8::Object>()));
                });

            cls.defineFunction(
                "update",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Buffer>(info.This());
                    c_obj->update(info[0].As<v8::ArrayBufferView>());
                });

            return scope.Escape(cls.flush());
        }
    }
}