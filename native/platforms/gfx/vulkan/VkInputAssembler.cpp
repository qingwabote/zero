#include "bindings/gfx/InputAssembler.hpp"
#include "VkInputAssembler_impl.hpp"
#include "VkBuffer_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding::gfx
{
    InputAssembler_impl::InputAssembler_impl(Device_impl *device) : _device(device) {}
    InputAssembler_impl::~InputAssembler_impl() {}

    InputAssembler::InputAssembler(std::unique_ptr<InputAssembler_impl> impl)
        : Binding(), _impl(std::move(impl)) {}

    bool InputAssembler::initialize(v8::Local<v8::Object> info)
    {
        v8::Isolate *isolate = v8::Isolate::GetCurrent();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        auto &c_vertexInput = _impl->_vertexInput;
        v8::Local<v8::Object> js_vertexInput = sugar::v8::object_get(info, "vertexInput").As<v8::Object>();
        v8::Local<v8::Array> js_vertexBuffers = sugar::v8::object_get(js_vertexInput, "vertexBuffers").As<v8::Array>();

        c_vertexInput.vertexBuffers.resize(js_vertexBuffers->Length());
        for (uint32_t i = 0; i < c_vertexInput.vertexBuffers.size(); i++)
        {
            Buffer *c_buffer = Binding::c_obj<Buffer>(js_vertexBuffers->Get(context, i).ToLocalChecked().As<v8::Object>());
            c_vertexInput.vertexBuffers[i] = c_buffer->impl();
        }

        v8::Local<v8::Array> js_vertexOffsets = sugar::v8::object_get(js_vertexInput, "vertexOffsets").As<v8::Array>();
        c_vertexInput.vertexOffsets.resize(js_vertexOffsets->Length());
        for (uint32_t i = 0; i < c_vertexInput.vertexOffsets.size(); i++)
        {
            c_vertexInput.vertexOffsets[i] = js_vertexOffsets->Get(context, i).ToLocalChecked().As<v8::Number>()->Value();
        }

        v8::Local<v8::Object> js_indexBuffer = sugar::v8::object_get(js_vertexInput, "indexBuffer").As<v8::Object>();
        c_vertexInput.indexBuffer = Binding::c_obj<Buffer>(js_indexBuffer)->impl();
        c_vertexInput.indexType = static_cast<VkIndexType>(sugar::v8::object_get(js_vertexInput, "indexType").As<v8::Number>()->Value());
        c_vertexInput.indexCount = sugar::v8::object_get(js_vertexInput, "indexCount").As<v8::Number>()->Value();
        c_vertexInput.indexOffset = sugar::v8::object_get(js_vertexInput, "indexOffset").As<v8::Number>()->Value();

        return false;
    }

    InputAssembler::~InputAssembler()
    {
    }
}
