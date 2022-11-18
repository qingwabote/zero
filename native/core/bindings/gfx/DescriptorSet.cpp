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
            cls.defineAccessor(
                "layout",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    info.GetReturnValue().Set(c_obj->retrieve("layout"));
                });
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(c_obj->retain<DescriptorSetLayout>(info[0].As<v8::Object>(), "layout")));
                });
            cls.defineFunction(
                "getBuffer",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    uint32_t binding = info[0].As<v8::Number>()->Value();
                    info.GetReturnValue().Set(c_obj->retrieve("buffer_" + std::to_string(binding)));
                });
            cls.defineFunction(
                "bindBuffer",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    uint32_t binding = info[0].As<v8::Number>()->Value();
                    Buffer *c_buffer = c_obj->retain<Buffer>(info[1].As<v8::Object>(), "buffer_" + std::to_string(binding));
                    double range = (info.Length() > 2 && !info[2]->IsUndefined()) ? info[2].As<v8::Number>()->Value() : 0;
                    c_obj->bindBuffer(binding, c_buffer, range);
                });
            cls.defineFunction(
                "getTexture",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    uint32_t binding = info[0].As<v8::Number>()->Value();
                    info.GetReturnValue().Set(c_obj->retrieve("texture_" + std::to_string(binding)));
                });
            cls.defineFunction(
                "bindTexture",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    uint32_t binding = info[0].As<v8::Number>()->Value();
                    Texture *c_texture = c_obj->retain<Texture>(info[1].As<v8::Object>(), "texture_" + std::to_string(binding));
                    c_obj->bindTexture(binding, c_texture);
                });
            return scope.Escape(cls.flush());
        }
    }
}