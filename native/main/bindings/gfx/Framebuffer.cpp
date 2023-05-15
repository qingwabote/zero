#include "Framebuffer.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Framebuffer::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            auto ctor = Binding::createTemplate();

            sugar::v8::ctor_name(ctor, "Framebuffer");
            sugar::v8::ctor_accessor(
                ctor,
                "info",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Framebuffer>(info.This());
                    info.GetReturnValue().Set(c_obj->_info.Get(info.GetIsolate()));
                });
            sugar::v8::ctor_function(
                ctor,
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Framebuffer>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(c_obj->retain(info[0], c_obj->_info)));
                });
            return scope.Escape(ctor);
        }
    }
}