#include "DescriptorSet.hpp"
#include "DescriptorSetLayout.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> DescriptorSet::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"DescriptorSet"};
            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<DescriptorSet *>(info.This()->GetAlignedPointerFromInternalField(0));
                    DescriptorSetLayout *setLayout = static_cast<DescriptorSetLayout *>(info[0].As<v8::Object>()->GetAlignedPointerFromInternalField(0));
                    info.GetReturnValue().Set(cobj->initialize(setLayout));
                });
            cls.defineFunction(
                "bindBuffer",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<DescriptorSet *>(info.This()->GetAlignedPointerFromInternalField(0));
                    uint32_t binding = info[0].As<v8::Number>()->Value();
                    Buffer *buffer = static_cast<Buffer *>(info[1].As<v8::Object>()->GetAlignedPointerFromInternalField(0));
                    cobj->bindBuffer(binding, buffer);
                });

            return scope.Escape(cls.flush());
        }
    }
}