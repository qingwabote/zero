#pragma once

#include "v8.h"

namespace binding
{
    namespace gfx
    {
        v8::Local<v8::Object> device(v8::Local<v8::Context> context);
    }
}