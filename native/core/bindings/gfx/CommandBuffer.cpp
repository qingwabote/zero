#include "CommandBuffer.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> CommandBuffer::createTemplate()
        {

            v8::EscapableHandleScope scope(v8::Isolate::GetCurrent());

            sugar::v8::Class cls{"CommandBuffer"};

            return scope.Escape(cls.flush());
        }
    }
}