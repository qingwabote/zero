#include "CommandBuffer.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> CommandBuffer::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"CommandBuffer"};
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->initialize();
                });
            cls.defineFunction(
                "begin",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->releaseAll();
                    c_obj->begin();
                });
            cls.defineFunction(
                "copyBuffer",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    auto js_view = info[0].As<v8::ArrayBufferView>();
                    auto c_buffer = c_obj->retain<Buffer>(info[1].As<v8::Object>());
                    c_obj->copyBuffer(js_view, c_buffer);
                });
            cls.defineFunction(
                "copyImageBitmapToTexture",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    auto c_imageBitmap = c_obj->retain<ImageBitmap>(info[0].As<v8::Object>());
                    auto c_texture = c_obj->retain<Texture>(info[1].As<v8::Object>());
                    c_obj->copyImageBitmapToTexture(c_imageBitmap, c_texture);
                });
            cls.defineFunction(
                "beginRenderPass",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->beginRenderPass(c_obj->retain<RenderPass>(info[0].As<v8::Object>()), info[1].As<v8::Object>());
                });
            cls.defineFunction(
                "bindDescriptorSet",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());

                    PipelineLayout *c_pipelineLayout = c_obj->retain<PipelineLayout>(info[0].As<v8::Object>());

                    uint32_t index = info[1].As<v8::Number>()->Value();

                    DescriptorSet *c_descriptorSet = c_obj->retain<DescriptorSet>(info[2].As<v8::Object>());

                    v8::Local<v8::Array> dynamicOffsets = info.Length() > 3 ? info[3].As<v8::Array>() : v8::Array::New(v8::Isolate::GetCurrent());

                    c_obj->bindDescriptorSet(c_pipelineLayout, index, c_descriptorSet, dynamicOffsets);
                });

            cls.defineFunction(
                "bindInputAssembler",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    auto js_inputAssembler = info[0].As<v8::Object>();
                    c_obj->retain(js_inputAssembler);
                    c_obj->retain(js_inputAssembler, "lastInputAssembler");
                    c_obj->bindInputAssembler(js_inputAssembler);
                });

            cls.defineFunction(
                "bindPipeline",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    Pipeline *c_pipeline = c_obj->retain<Pipeline>(info[0].As<v8::Object>());
                    c_obj->bindPipeline(c_pipeline);
                });

            cls.defineFunction(
                "draw",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->draw();
                });

            cls.defineFunction(
                "endRenderPass",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->endRenderPass();
                });

            cls.defineFunction(
                "end",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                    c_obj->end();
                });

            return scope.Escape(cls.flush());
        }
    }
}