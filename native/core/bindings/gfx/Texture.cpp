#include "Texture.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Texture::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"Texture"};
            cls.defineAccessor(
                "info",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Texture>(info.This());
                    info.GetReturnValue().Set(c_obj->retrieve("info"));
                });
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Texture>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(c_obj->retain(info[0].As<v8::Object>(), "info")));
                });
            return scope.Escape(cls.flush());
        }
    }
}