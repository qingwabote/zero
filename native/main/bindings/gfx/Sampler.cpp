#include "Sampler.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Sampler::createTemplate()
        {
            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            auto ctor = Binding::createTemplate();

            sugar::v8::ctor_name(ctor, "Sampler");
            sugar::v8::ctor_function(
                ctor,
                "initialize",
                [](const v8::FunctionCallbackInfo<v8::Value> &info)
                {
                    auto c_obj = Binding::c_obj<Sampler>(info.This());
                    info.GetReturnValue().Set(c_obj->initialize(c_obj->retain(info[0], c_obj->_info)));
                });
            return scope.Escape(ctor);
        }
    }
}