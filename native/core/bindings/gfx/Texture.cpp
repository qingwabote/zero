#include "Texture.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Texture::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"Texture"};
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Texture>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(info[0].As<v8::Object>()));
                });
            cls.defineFunction(
                "update",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Texture>(info.This());
                    c_obj->update(c_obj->retain<ImageBitmap>(info[0].As<v8::Object>(), "imageBitmap"));
                });
            return scope.Escape(cls.flush());
        }
    }
}