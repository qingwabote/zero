#include "device.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Device::createTemplate()
        {
            v8::EscapableHandleScope scope(_isolate);

            sugar::v8::Class cls{_isolate, "Device"};

            cls.defineAccessor(
                "commandBuffer",
                [](v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<Device *>(info.This()->GetAlignedPointerFromInternalField(0));
                    info.GetReturnValue().Set(cobj->commandBuffer()->js());
                });

            cls.defineFunction(
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<Device *>(info.This()->GetAlignedPointerFromInternalField(0));
                    info.GetReturnValue().Set(cobj->initialize());
                });

            cls.defineFunction(
                "createPipeline",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto cobj = static_cast<Device *>(info.This()->GetAlignedPointerFromInternalField(0));
                    info.GetReturnValue().Set(cobj->createPipeline()->js());
                });

            return scope.Escape(cls.flush());
        }
    }
}