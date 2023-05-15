#include "ImageBitmap.hpp"

namespace binding
{
    v8::Local<v8::FunctionTemplate> ImageBitmap::createTemplate()
    {
        auto ctor = Binding::createTemplate();

        sugar::v8::ctor_name(ctor, "ImageBitmap");
        sugar::v8::ctor_accessor(
            ctor,
            "width",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<ImageBitmap>(info.This());
                info.GetReturnValue().Set(c_obj->width());
            });
        sugar::v8::ctor_accessor(
            ctor,
            "height",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<ImageBitmap>(info.This());
                info.GetReturnValue().Set(c_obj->height());
            });
        return ctor;
    }
}
