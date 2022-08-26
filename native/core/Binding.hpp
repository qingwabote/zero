#pragma once

#include "sugars/v8sugar.hpp"

class Binding
{
private:
    v8::Global<v8::Object> _js;

protected:
    v8::Isolate *_isolate = nullptr;

    virtual v8::Local<v8::FunctionTemplate> createTemplate() { return {}; };

public:
    Binding(v8::Isolate *isolate);

    v8::Local<v8::Object> js();

    virtual ~Binding();
};
