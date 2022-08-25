#include "bindings/gfx/device.hpp"

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
                    if (cobj->initialize())
                    {
                        info.GetReturnValue().Set(true);
                        return;
                    }

                    v8::Isolate *_isolate = info.GetIsolate();
                    auto context = _isolate->GetCurrentContext();

                    // CommandBuffer::constructor(_isolate)->GetFunction(context).ToLocalChecked()->NewInstance(context).ToLocalChecked();

                    info.GetReturnValue().Set(false);
                });

            return scope.Escape(cls.flush());
        }
    }
}