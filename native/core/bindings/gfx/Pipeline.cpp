#include "Pipeline.hpp"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::FunctionTemplate> Pipeline::createTemplate()
        {
            v8::EscapableHandleScope scope(_isolate);

            sugar::v8::Class cls{_isolate, "Pipeline"};

            return scope.Escape(cls.flush());
        }
    }
}