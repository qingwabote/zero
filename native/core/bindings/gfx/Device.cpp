#include "device.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Device::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"Device"};

            cls.defineAccessor(
                "capabilities",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->retrieve("capabilities"));
                });

            cls.defineAccessor(
                "swapchain",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->retrieve("swapchain"));
                });

            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize());
                });

            cls.defineFunction(
                "createBuffer",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createBuffer()->js_obj());
                });

            cls.defineFunction(
                "createTexture",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createTexture()->js_obj());
                });

            cls.defineFunction(
                "createShader",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createShader()->js_obj());
                });

            cls.defineFunction(
                "createRenderPass",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createRenderPass()->js_obj());
                });

            cls.defineFunction(
                "createFramebuffer",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createFramebuffer()->js_obj());
                });

            cls.defineFunction(
                "createDescriptorSet",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createDescriptorSet()->js_obj());
                });

            cls.defineFunction(
                "createDescriptorSetLayout",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createDescriptorSetLayout()->js_obj());
                });

            cls.defineFunction(
                "createPipelineLayout",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createPipelineLayout()->js_obj());
                });

            cls.defineFunction(
                "createPipeline",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createPipeline()->js_obj());
                });

            cls.defineFunction(
                "createCommandBuffer",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createCommandBuffer()->js_obj());
                });

            cls.defineFunction(
                "createSemaphore",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createSemaphore()->js_obj());
                });

            cls.defineFunction(
                "createFence",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->createFence()->js_obj());
                });

            cls.defineFunction(
                "acquire",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    auto c_semaphore = c_obj->retain<Semaphore>(info[0].As<v8::Object>(), "acquire_semaphore");
                    c_obj->acquire(c_semaphore);
                });

            cls.defineFunction(
                "submit",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    auto js_info = info[0].As<v8::Object>();
                    auto c_fence = c_obj->retain<Fence>(info[1].As<v8::Object>());
                    c_obj->submit(js_info, c_fence);
                    c_fence->retain(js_info, "submitInfo");
                });
            cls.defineFunction(
                "present",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    auto c_waitSemaphore = c_obj->retain<Semaphore>(info[0].As<v8::Object>(), "present_semaphore");
                    c_obj->present(c_waitSemaphore);
                });
            cls.defineFunction(
                "waitFence",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    auto c_fence = Binding::c_obj<Fence>(info[0].As<v8::Object>());
                    c_obj->waitFence(c_fence);
                    c_obj->release(c_fence->js_obj());
                });
            return scope.Escape(cls.flush());
        }
    }
}