#pragma once

#include "v8.h"

namespace binding
{
    v8::Local<v8::Object> console(v8::Local<v8::Context> context);
}