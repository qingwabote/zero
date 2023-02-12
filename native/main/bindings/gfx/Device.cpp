#include "Device.hpp"
#include "DeviceThread.hpp"

namespace binding::gfx
{
    ThreadPool &DeviceThread::instance()
    {
        static ThreadPool instance{1};
        return instance;
    }

    v8::Local<v8::FunctionTemplate> Device::createTemplate()
    {
        v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

        sugar::v8::Class cls{"Device"};

        cls.defineAccessor(
            "capabilities",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->_capabilities.Get(info.GetIsolate()));
            });

        cls.defineAccessor(
            "swapchain",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->_swapchain.Get(info.GetIsolate()));
            });

        cls.defineAccessor(
            "queue",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->_queue.Get(info.GetIsolate()));
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
            "createSampler",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createSampler()->js_obj());
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
            "createInputAssembler",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createInputAssembler()->js_obj());
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
                auto c_semaphore = c_obj->retain<Semaphore>(info[0], c_obj->_acquire_semaphore);
                c_obj->acquire(c_semaphore);
            });

        return scope.Escape(cls.flush());
    }
}
