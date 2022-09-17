#include "CommandBuffer.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> CommandBuffer::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"CommandBuffer"};
            cls.defineFunction(
                "begin",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->begin();
                });
            cls.defineFunction(
                "beginRenderPass",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->beginRenderPass(info[0].As<v8::Object>());
                });
            cls.defineFunction(
                "bindDescriptorSet",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    uint32_t index = info[0].As<v8::Number>()->Value();
                    std::string key = "descriptorSet_" + std::to_string(index);
                    c_obj->bindDescriptorSet(index, c_obj->retain<DescriptorSet>(info[1].As<v8::Object>(), key.c_str()));
                });

            cls.defineFunction(
                "bindInputAssembler",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->bindInputAssembler(info[0].As<v8::Object>());
                });

            return scope.Escape(cls.flush());
        }
    }
}