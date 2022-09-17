#pragma once

#include "sugars/v8sugar.hpp"

class Binding
{
private:
    v8::Global<v8::Object> _js_obj;

protected:
    virtual v8::Local<v8::FunctionTemplate> createTemplate() { return {}; };

public:
    template <class T>
    static T *c_obj(v8::Local<v8::Object> js_obj)
    {
        return static_cast<T *>(js_obj->GetAlignedPointerFromInternalField(0));
    }

    Binding();

    v8::Local<v8::Object> js_obj();

    template <class T>
    T *retain(v8::Local<v8::Object> js_obj, const std::string &key = "")
    {
        retain(js_obj, key);
        return c_obj<T>(js_obj);
    }

    void retain(v8::Local<v8::Object> js_obj, const std::string &key = "");

    void release(v8::Local<v8::Object> js_obj);

    v8::Local<v8::Object> retrieve(const char *key);

    virtual ~Binding();
};
