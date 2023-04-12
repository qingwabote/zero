#include "CommandBuffer.hpp"
#include "DeviceThread.hpp"

namespace binding::gfx
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

                auto f = new auto(
                    [=]()
                    {
                        c_obj->begin();
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        cls.defineFunction(
            "copyBuffer",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());

                auto js_buffer = c_obj->retain(info[0]).As<v8::ArrayBuffer>();
                auto backingStore = js_buffer->GetBackingStore();
                auto c_buffer = c_obj->retain<Buffer>(info[1]);
                size_t srcOffset = info[2].As<v8::Number>()->Value();
                size_t length = info[3].As<v8::Number>()->Value();

                auto f = new auto(
                    [=]()
                    {
                        c_obj->copyBuffer(backingStore, c_buffer, srcOffset, length);
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });
        cls.defineFunction(
            "copyImageBitmapToTexture",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                auto c_imageBitmap = c_obj->retain<ImageBitmap>(info[0]);
                auto c_texture = c_obj->retain<Texture>(info[1]);

                auto f = new auto(
                    [=]()
                    {
                        c_obj->copyImageBitmapToTexture(c_imageBitmap, c_texture);
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });
        cls.defineFunction(
            "beginRenderPass",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                auto c_renderPass = c_obj->retain<RenderPass>(info[0]);
                auto c_framebuffer = c_obj->retain<Framebuffer>(info[1]);
                auto js_area = info[2].As<v8::Object>();
                RenderArea c_area{};
                c_area.x = sugar::v8::object_get(js_area, "x").As<v8::Number>()->Value();
                c_area.y = sugar::v8::object_get(js_area, "y").As<v8::Number>()->Value();
                c_area.width = sugar::v8::object_get(js_area, "width").As<v8::Number>()->Value();
                c_area.height = sugar::v8::object_get(js_area, "height").As<v8::Number>()->Value();

                auto f = new auto(
                    [=]()
                    {
                        c_obj->beginRenderPass(c_renderPass, c_framebuffer, c_area);
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });
        cls.defineFunction(
            "bindDescriptorSet",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());

                PipelineLayout *c_pipelineLayout = c_obj->retain<PipelineLayout>(info[0]);
                uint32_t index = info[1].As<v8::Number>()->Value();
                DescriptorSet *c_descriptorSet = c_obj->retain<DescriptorSet>(info[2]);
                std::unique_ptr<std::vector<uint32_t>> c_dynamicOffsets;
                if (info.Length() > 3)
                {
                    v8::Local<v8::Array> js_dynamicOffsets = info[3].As<v8::Array>();
                    c_dynamicOffsets = std::make_unique<std::vector<uint32_t>>(js_dynamicOffsets->Length());
                    for (uint32_t i = 0; i < c_dynamicOffsets->size(); i++)
                    {
                        (*c_dynamicOffsets)[i] = js_dynamicOffsets->Get(info.GetIsolate()->GetCurrentContext(), i).ToLocalChecked().As<v8::Number>()->Value();
                    }
                }

                auto f = new auto(
                    [=, c_dynamicOffsets = std::move(c_dynamicOffsets)]() mutable
                    {
                        c_obj->bindDescriptorSet(c_pipelineLayout, index, c_descriptorSet, std::move(c_dynamicOffsets));
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        cls.defineFunction(
            "bindInputAssembler",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                auto c_inputAssembler = c_obj->retain<InputAssembler>(info[0]); // retain all inputAssemblers until the resetting of command buffer

                auto f = new auto(
                    [=]()
                    {
                        c_obj->bindInputAssembler(c_inputAssembler);
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        cls.defineFunction(
            "bindPipeline",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                Pipeline *c_pipeline = c_obj->retain<Pipeline>(info[0]);

                auto f = new auto(
                    [=]()
                    {
                        c_obj->bindPipeline(c_pipeline);
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        cls.defineFunction(
            "draw",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                uint32_t count = info[0].As<v8::Number>()->Value();

                auto f = new auto(
                    [=]()
                    {
                        c_obj->draw(count);
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        cls.defineFunction(
            "drawIndexed",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());
                uint32_t count = info[0].As<v8::Number>()->Value();

                auto f = new auto(
                    [=]()
                    {
                        c_obj->drawIndexed(count);
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        cls.defineFunction(
            "endRenderPass",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());

                auto f = new auto(
                    [=]()
                    {
                        c_obj->endRenderPass();
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        cls.defineFunction(
            "end",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<CommandBuffer>(info.This());

                auto f = new auto(
                    [=]()
                    {
                        c_obj->end();
                    });
                DeviceThread::instance().run(UniqueFunction::create<decltype(f)>(f));
            });

        return scope.Escape(cls.flush());
    }
}