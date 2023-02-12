#include "DescriptorSetLayout.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> DescriptorSetLayout::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"DescriptorSetLayout"};
            cls.defineAccessor(
                "bindings",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSetLayout>(info.This());
                    info.GetReturnValue().Set(c_obj->_bindings.Get(info.GetIsolate()));
                });
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSetLayout>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(c_obj->retain(info[0], c_obj->_bindings).As<v8::Array>()));
                });

            return scope.Escape(cls.flush());
        }
    }
}