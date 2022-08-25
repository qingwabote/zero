#include "CommandBuffer.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> CommandBuffer::createTemplate()
        {
            v8::EscapableHandleScope scope(_isolate);

            sugar::v8::Class cls{_isolate, "CommandBuffer"};

            return scope.Escape(cls.flush());
        }
    }
}