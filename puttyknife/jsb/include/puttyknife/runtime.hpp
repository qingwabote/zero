#pragma once

#include <v8.h>

namespace puttyknife
{
    void Runtime(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj);
}
