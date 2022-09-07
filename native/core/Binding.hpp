#pragma once

#include "v8.h"

class Binding
{
private:
    v8::Global<v8::Object> _js;

protected:
    virtual v8::Local<v8::FunctionTemplate> createTemplate() { return {}; };

public:
    Binding();

    v8::Local<v8::Object> js();

    virtual ~Binding();
};
