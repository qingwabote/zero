#include "gfx/InputAssembler.hpp"
#include "VkInputAssembler_impl.hpp"
#include "gfx/Buffer.hpp"
#include "VkBuffer_impl.hpp"

namespace gfx
{
    InputAssembler_impl::InputAssembler_impl(Device_impl *device) : _device(device) {}
    InputAssembler_impl::~InputAssembler_impl() {}

    InputAssembler::InputAssembler(Device_impl *device) : _impl(std::make_unique<InputAssembler_impl>(device)) {}

    bool InputAssembler::initialize(const std::shared_ptr<InputAssemblerInfo> &info)
    {
        auto c_vertexInput = std::make_unique<InputAssembler_impl::VkVertexInput>();
        auto js_vertexInput = info->vertexInput;
        auto js_vertexBuffers = js_vertexInput->buffers;
        c_vertexInput->vertexBuffers.resize(js_vertexBuffers->size());
        for (uint32_t i = 0; i < c_vertexInput->vertexBuffers.size(); i++)
        {
            Buffer *c_buffer = js_vertexBuffers->at(i).get();
            c_vertexInput->vertexBuffers[i] = c_buffer->impl();
        }
        auto js_vertexOffsets = js_vertexInput->offsets;
        c_vertexInput->vertexOffsets.resize(js_vertexOffsets->size());
        for (uint32_t i = 0; i < c_vertexInput->vertexOffsets.size(); i++)
        {
            c_vertexInput->vertexOffsets[i] = js_vertexOffsets->at(i);
        }
        _impl->_vertexInput = std::move(c_vertexInput);

        auto gfx_indexInput = info->indexInput;
        if (gfx_indexInput)
        {
            auto indexInput = std::make_unique<InputAssembler_impl::VkIndexInput>();
            indexInput->indexBuffer = gfx_indexInput->buffer->impl();
            indexInput->indexOffset = 0; // WebGL can not specify the offset of the index buffer at buffer binding
            indexInput->indexType = static_cast<VkIndexType>(gfx_indexInput->type);
            _impl->_indexInput = std::move(indexInput);
        }

        _info = info;
        return false;
    }

    InputAssembler::~InputAssembler() {}
}
