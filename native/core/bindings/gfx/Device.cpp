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
                    info.GetReturnValue().Set(c_obj->capabilities());
                });

            cls.defineAccessor(
                "commandBuffer",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    info.GetReturnValue().Set(c_obj->commandBuffer());
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
                "present",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Device>(info.This());
                    c_obj->present();
                });
            return scope.Escape(cls.flush());
        }
    }
}