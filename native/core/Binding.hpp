#pragma once

#include "sugars/v8sugar.hpp"

class Binding
{
private:
    sugar::v8::Weak<v8::Object> _js_obj;

    sugar::v8::Weak<v8::Object> _js_props;

    v8::Local<v8::Object> js_props();

protected:
    virtual v8::Local<v8::FunctionTemplate> createTemplate() = 0;

public:
    template <class T>
    inline static T *c_obj(v8::Local<v8::Object> js_obj)
    {
        return static_cast<T *>(js_obj->GetAlignedPointerFromInternalField(0));
    }

    Binding();

    v8::Local<v8::Object> js_obj();

    template <class T>
    inline T *retain(v8::Local<v8::Value> js_obj, sugar::v8::Weak<v8::Object> &handle)
    {
        return c_obj<T>(retain(js_obj, handle));
    }

    template <class T>
    inline T *retain(v8::Local<v8::Value> js_obj)
    {
        return c_obj<T>(retain(js_obj));
    }

    v8::Local<v8::Object> retain(v8::Local<v8::Value> val, sugar::v8::Weak<v8::Object> &handle);

    v8::Local<v8::Object> retain(v8::Local<v8::Value> val);

    void release(v8::Local<v8::Object> js_obj);

    void releaseAll();

    virtual ~Binding();
};
