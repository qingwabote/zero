#include "ImageBitmap.hpp"

namespace binding
{
    v8::Local<v8::FunctionTemplate> ImageBitmap::createTemplate()
    {
        sugar::v8::Class cls{"ImageBitmap"};
        cls.defineAccessor(
            "width",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<ImageBitmap>(info.This());
                info.GetReturnValue().Set(c_obj->width());
            });
        cls.defineAccessor(
            "height",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<ImageBitmap>(info.This());
                info.GetReturnValue().Set(c_obj->height());
            });
        return cls.flush();
    }
}
