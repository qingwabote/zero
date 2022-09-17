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

                    PipelineLayout *c_pipelineLayout = Binding::c_obj<PipelineLayout>(info[0].As<v8::Object>());

                    uint32_t index = info[1].As<v8::Number>()->Value();

                    DescriptorSet *c_descriptorSet = c_obj->retain<DescriptorSet>(info[2].As<v8::Object>(), "descriptorSet_" + std::to_string(index));

                    c_obj->bindDescriptorSet(c_pipelineLayout, index, c_descriptorSet);
                });

            cls.defineFunction(
                "bindInputAssembler",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->bindInputAssembler(info[0].As<v8::Object>());
                });

            cls.defineFunction(
                "bindPipeline",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->bindPipeline(info[0].As<v8::Object>());
                });

            cls.defineFunction(
                "draw",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->draw();
                });

            return scope.Escape(cls.flush());
        }
    }
}