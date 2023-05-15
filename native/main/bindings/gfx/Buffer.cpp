#include "Buffer.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Buffer::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            auto ctor = Binding::createTemplate();

            sugar::v8::ctor_name(ctor, "Buffer");

            sugar::v8::ctor_accessor(
                ctor,
                "info",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Buffer>(info.This());
                    info.GetReturnValue().Set(c_obj->_info.Get(info.GetIsolate()));
                });

            sugar::v8::ctor_function(
                ctor,
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Buffer>(info.This());

                    auto js_info = c_obj->retain(info[0], c_obj->_info).As<v8::Object>();
                    BufferInfo c_info = {};
                    c_info.usage = sugar::v8::object_get(js_info, "usage").As<v8::Number>()->Value();
                    c_info.size = sugar::v8::object_get(js_info, "size").As<v8::Number>()->Value();
                    c_info.mem_usage = sugar::v8::object_get(js_info, "mem_usage").As<v8::Number>()->Value();

                    info.GetReturnValue().Set(c_obj->initialize(c_info));
                });

            sugar::v8::ctor_function(
                ctor,
                "update",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Buffer>(info.This());
                    c_obj->update(info[0].As<v8::ArrayBuffer>(), info[1].As<v8::Number>()->Value(), info[2].As<v8::Number>()->Value());
                });

            return scope.Escape(ctor);
        }
    }
}