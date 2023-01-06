#include "DescriptorSet.hpp"
#include "DescriptorSetLayout.hpp"
#include "Buffer.hpp"

sugar::v8::Weak<v8::Object> &getHandle(std::unordered_map<std::string, sugar::v8::Weak<_v8::Object>> &handleMap, std::string &key)
{
    auto it = handleMap.find(key);
    if (it == handleMap.end())
    {
        it = handleMap.emplace(key, sugar::v8::Weak<v8::Object>()).first;
    }
    return it->second;
}

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
                    info.GetReturnValue().Set(c_obj->_layout.Get(info.GetIsolate()));
                });
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(c_obj->retain<DescriptorSetLayout>(info[0], c_obj->_layout)));
                });
            cls.defineFunction(
                "bindBuffer",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    uint32_t binding = info[0].As<v8::Number>()->Value();

                    Buffer *c_buffer = c_obj->retain<Buffer>(info[1], getHandle(c_obj->_bindedResources, "buffer_" + std::to_string(binding)));
                    double range = (info.Length() > 2 && !info[2]->IsUndefined()) ? info[2].As<v8::Number>()->Value() : 0;
                    c_obj->bindBuffer(binding, c_buffer, range);
                });
            cls.defineFunction(
                "bindTexture",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<DescriptorSet>(info.This());
                    uint32_t binding = info[0].As<v8::Number>()->Value();
                    Texture *c_texture = c_obj->retain<Texture>(info[1], getHandle(c_obj->_bindedResources, "texture_" + std::to_string(binding)));
                    Sampler *c_sampler = c_obj->retain<Sampler>(info[2], getHandle(c_obj->_bindedResources, "sampler_" + std::to_string(binding)));
                    c_obj->bindTexture(binding, c_texture, c_sampler);
                });
            return scope.Escape(cls.flush());
        }
    }
}