#include "DescriptorSet.hpp"
#include "DescriptorSetLayout.hpp"
#include "Buffer.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> DescriptorSet::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"DescriptorSet"};
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(c_obj->retain<DescriptorSetLayout>(info[0].As<v8::Object>())));
                });
            cls.defineFunction(
                "bindBuffer",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    uint32_t binding = info[0].As<v8::Number>()->Value();
                    std::string key = "buffer_" + std::to_string(binding);
                    Buffer *c_buffer = c_obj->retain<Buffer>(info[1].As<v8::Object>(), key.c_str());
                    c_obj->bindBuffer(binding, c_buffer);
                });

            return scope.Escape(cls.flush());
        }
    }
}