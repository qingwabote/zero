#include "bindings/gfx/commandbuffer.hpp"

namespace binding
{
    namespace gfx
    {
        CommandBuffer::CommandBuffer(v8::Isolate *isolate) : Binding(isolate) {}

        CommandBuffer::~CommandBuffer()
        {
        }
    }
}
