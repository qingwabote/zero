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
                    auto js_view = c_obj->retain(info[0]).As<v8::ArrayBufferView>();
                    auto src = reinterpret_cast<const uint8_t *>(js_view->Buffer()->Data()) + js_view->ByteOffset();
                    auto c_buffer = c_obj->retain<Buffer>(info[1].As<v8::Object>());
                    c_obj->copyBuffer(src, c_buffer, js_view->ByteLength());
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
                    auto c_renderPass = c_obj->retain<RenderPass>(info[0].As<v8::Object>());
                    auto c_framebuffer = c_obj->retain<Framebuffer>(info[1].As<v8::Object>());
                    auto js_area = info[2].As<v8::Object>();
                    RenderArea c_area{};
                    c_area.x = sugar::v8::object_get(js_area, "x").As<v8::Number>()->Value();
                    c_area.y = sugar::v8::object_get(js_area, "y").As<v8::Number>()->Value();
                    c_area.width = sugar::v8::object_get(js_area, "width").As<v8::Number>()->Value();
                    c_area.height = sugar::v8::object_get(js_area, "height").As<v8::Number>()->Value();
                    c_obj->beginRenderPass(c_renderPass, c_framebuffer, c_area);
                });
            cls.defineFunction(
                "bindDescriptorSet",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    static std::vector<uint32_t> c_dynamicOffsets;

                    v8::Isolate *isolate = v8::Isolate::GetCurrent();
                    v8::Local<v8::Context> context = isolate->GetCurrentContext();

                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());

                    PipelineLayout *c_pipelineLayout = c_obj->retain<PipelineLayout>(info[0].As<v8::Object>());
                    uint32_t index = info[1].As<v8::Number>()->Value();
                    DescriptorSet *c_descriptorSet = c_obj->retain<DescriptorSet>(info[2].As<v8::Object>());
                    if (info.Length() > 3)
                    {
                        v8::Local<v8::Array> js_dynamicOffsets = info[3].As<v8::Array>();
                        c_dynamicOffsets.resize(js_dynamicOffsets->Length());
                        for (uint32_t i = 0; i < js_dynamicOffsets->Length(); i++)
                        {
                            c_dynamicOffsets[i] = js_dynamicOffsets->Get(context, i).ToLocalChecked().As<v8::Number>()->Value();
                        }
                    }
                    else
                    {
                        c_dynamicOffsets.resize(0);
                    }

                    c_obj->bindDescriptorSet(c_pipelineLayout, index, c_descriptorSet, c_dynamicOffsets);
                });

            cls.defineFunction(
                "bindInputAssembler",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    static InputAssembler c_inputAssembler{};

                    v8::Isolate *isolate = v8::Isolate::GetCurrent();
                    v8::Local<v8::Context> context = isolate->GetCurrentContext();

                    auto c_obj = Binding::c_obj<CommandBuffer>(info.This());

                    VertexInput &c_vertexInput = c_inputAssembler.vertexInput;
                    auto js_inputAssembler = c_obj->retain(info[0]).As<v8::Object>();
                    v8::Local<v8::Object> js_vertexInput = sugar::v8::object_get(js_inputAssembler, "vertexInput").As<v8::Object>();
                    v8::Local<v8::Array> js_vertexBuffers = sugar::v8::object_get(js_vertexInput, "vertexBuffers").As<v8::Array>();

                    c_vertexInput.vertexBuffers.resize(js_vertexBuffers->Length());
                    for (uint32_t i = 0; i < c_vertexInput.vertexBuffers.size(); i++)
                    {
                        Buffer *c_buffer = Binding::c_obj<Buffer>(js_vertexBuffers->Get(context, i).ToLocalChecked().As<v8::Object>());
                        c_vertexInput.vertexBuffers[i] = c_buffer;
                    }

                    v8::Local<v8::Array> js_vertexOffsets = sugar::v8::object_get(js_vertexInput, "vertexOffsets").As<v8::Array>();
                    c_vertexInput.vertexOffsets.resize(js_vertexOffsets->Length());
                    for (uint32_t i = 0; i < c_vertexInput.vertexOffsets.size(); i++)
                    {
                        c_vertexInput.vertexOffsets[i] = js_vertexOffsets->Get(context, i).ToLocalChecked().As<v8::Number>()->Value();
                    }

                    v8::Local<v8::Object> js_indexBuffer = sugar::v8::object_get(js_vertexInput, "indexBuffer").As<v8::Object>();
                    c_vertexInput.indexBuffer = Binding::c_obj<Buffer>(js_indexBuffer);
                    c_vertexInput.indexType = sugar::v8::object_get(js_vertexInput, "indexType").As<v8::Number>()->Value();
                    c_vertexInput.indexCount = sugar::v8::object_get(js_vertexInput, "indexCount").As<v8::Number>()->Value();
                    c_vertexInput.indexOffset = sugar::v8::object_get(js_vertexInput, "indexOffset").As<v8::Number>()->Value();

                    c_obj->bindInputAssembler(c_inputAssembler);
                    c_obj->retain(js_inputAssembler, "lastInputAssembler");
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