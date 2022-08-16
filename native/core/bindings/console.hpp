#pragma once

#include "v8.h"

namespace binding
{
    void console(v8::Local<v8::Context> context, v8::Local<v8::Object> ns);
}