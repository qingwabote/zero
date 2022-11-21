#pragma once

#include "sugars/v8sugar.hpp"

class Binding
{
private:
    v8::Global<v8::Object> _js_obj;

protected:
    virtual v8::Local<v8::FunctionTemplate> createTemplate() = 0;

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

    v8::Local<v8::Value> retain(v8::Local<v8::Value> val, const std::string &key = "");

    void release(v8::Local<v8::Object> js_obj);

    void releaseAll();

    template <class T>
    T *retrieve(const std::string &key)
    {
        return c_obj<T>(retrieve(key));
    }

    v8::Local<v8::Object> retrieve(const std::string &key);

    virtual ~Binding() {}
};
