#include "Binding.hpp"
#include <typeinfo>

Binding::Binding() {}

v8::Local<v8::Object> Binding::js_obj()
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    if (!_js_obj.IsEmpty())
    {
        return _js_obj.Get(isolate);
    }

    v8::EscapableHandleScope scope(isolate);
    auto context = isolate->GetCurrentContext();

    v8::Local<v8::FunctionTemplate> constructor;
    auto cache = sugar::v8::isolate_getConstructorCache(isolate);
    auto key = typeid(*this).name();
    auto it = cache->find(key);
    if (it == cache->end())
    {
        constructor = cache->emplace(key, v8::Global<v8::FunctionTemplate>{isolate, createTemplate()}).first->second.Get(isolate);
    }
    else
    {
        constructor = it->second.Get(isolate);
    }

    v8::Local<v8::Object> obj = constructor->GetFunction(context).ToLocalChecked()->NewInstance(context).ToLocalChecked();
    obj->SetAlignedPointerInInternalField(0, this);

    sugar::v8::setWeakCallback(obj, [this]()
                               { delete this; });

    _js_obj.Reset(isolate, obj);

    return scope.Escape(obj);
}

v8::Local<v8::Object> Binding::js_props()
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    if (_js_props.IsEmpty())
    {
        v8::Local<v8::Object> props = v8::Map::New(isolate);
        sugar::v8::object_set(js_obj(), "_props_", props);
        _js_props.Reset(isolate, props);
    }
    return _js_props.Get(isolate);
}

v8::Local<v8::Object> Binding::retain(v8::Local<v8::Value> val, sugar::v8::Weak<v8::Object> &handle)
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope{isolate};
    v8::Local<v8::Context> context = isolate->GetCurrentContext();

    v8::Local<v8::Map> map = js_props().As<v8::Map>();
    map->Set(context, val, val);

    if (!handle.IsEmpty())
    {
        map->Delete(context, handle.Get(isolate));
    }
    handle.Reset(isolate, val.As<v8::Object>());

    return val.As<v8::Object>();
}

v8::Local<v8::Object> Binding::retain(v8::Local<v8::Value> val)
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope{isolate};
    v8::Local<v8::Context> context = isolate->GetCurrentContext();

    v8::Local<v8::Map> map = js_props().As<v8::Map>();
    map->Set(context, val, val);
    return val.As<v8::Object>();
}

void Binding::release(v8::Local<v8::Object> obj)
{
    v8::Local<v8::Map> map = js_props().As<v8::Map>();
    map->Delete(v8::Isolate::GetCurrent()->GetCurrentContext(), obj);
}

void Binding::releaseAll()
{
    v8::Local<v8::Map> map = js_props().As<v8::Map>();
    map->Clear();
}

Binding::~Binding() {}
