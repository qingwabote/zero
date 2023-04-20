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

        auto c_vertexInput = std::make_unique<InputAssembler_impl::VkVertexInput>();
        v8::Local<v8::Object> js_vertexInput = sugar::v8::object_get(info, "vertexInput").As<v8::Object>();
        v8::Local<v8::Array> js_vertexBuffers = sugar::v8::object_get(js_vertexInput, "buffers").As<v8::Array>();
        c_vertexInput->vertexBuffers.resize(js_vertexBuffers->Length());
        for (uint32_t i = 0; i < c_vertexInput->vertexBuffers.size(); i++)
        {
            Buffer *c_buffer = Binding::c_obj<Buffer>(js_vertexBuffers->Get(context, i).ToLocalChecked().As<v8::Object>());
            c_vertexInput->vertexBuffers[i] = c_buffer->impl();
        }
        v8::Local<v8::Array> js_vertexOffsets = sugar::v8::object_get(js_vertexInput, "offsets").As<v8::Array>();
        c_vertexInput->vertexOffsets.resize(js_vertexOffsets->Length());
        for (uint32_t i = 0; i < c_vertexInput->vertexOffsets.size(); i++)
        {
            c_vertexInput->vertexOffsets[i] = js_vertexOffsets->Get(context, i).ToLocalChecked().As<v8::Number>()->Value();
        }
        _impl->_vertexInput = std::move(c_vertexInput);

        v8::Local<v8::Object> js_indexInput = sugar::v8::object_get(info, "indexInput").As<v8::Object>();
        if (!js_indexInput->IsUndefined())
        {
            auto c_indexInput = std::make_unique<InputAssembler_impl::VkIndexInput>();
            v8::Local<v8::Object> js_indexBuffer = sugar::v8::object_get(js_indexInput, "buffer").As<v8::Object>();
            c_indexInput->indexBuffer = Binding::c_obj<Buffer>(js_indexBuffer)->impl();
            c_indexInput->indexOffset = sugar::v8::object_get(js_indexInput, "offset").As<v8::Number>()->Value();
            c_indexInput->indexType = static_cast<VkIndexType>(sugar::v8::object_get(js_indexInput, "type").As<v8::Number>()->Value());
            _impl->_indexInput = std::move(c_indexInput);
        }

        return false;
    }

    InputAssembler::~InputAssembler()
    {
    }
}
