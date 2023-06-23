#pragma once

#include "v8/v8.h"

void console_initialize(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj);