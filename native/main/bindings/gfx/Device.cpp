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

        auto ctor = Binding::createTemplate();

        sugar::v8::ctor_name(ctor, "Device");

        sugar::v8::ctor_accessor(
            ctor,
            "capabilities",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->_capabilities.Get(info.GetIsolate()));
            });

        sugar::v8::ctor_accessor(
            ctor,
            "swapchain",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->_swapchain.Get(info.GetIsolate()));
            });

        sugar::v8::ctor_accessor(
            ctor,
            "queue",
            [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->_queue.Get(info.GetIsolate()));
            });

        sugar::v8::ctor_function(
            ctor,
            "createBuffer",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createBuffer()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createTexture",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createTexture()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createSampler",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createSampler()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createShader",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createShader()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createRenderPass",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createRenderPass()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createFramebuffer",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createFramebuffer()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createDescriptorSetLayout",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createDescriptorSetLayout()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createInputAssembler",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createInputAssembler()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createPipelineLayout",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createPipelineLayout()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createPipeline",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createPipeline()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createCommandBuffer",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createCommandBuffer()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createSemaphore",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createSemaphore()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "createFence",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                info.GetReturnValue().Set(c_obj->createFence()->js_obj());
            });

        sugar::v8::ctor_function(
            ctor,
            "acquire",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto c_obj = Binding::c_obj<Device>(info.This());
                auto c_semaphore = c_obj->retain<Semaphore>(info[0], c_obj->_acquire_semaphore);
                c_obj->acquire(c_semaphore);
            });

        return scope.Escape(ctor);
    }
}
