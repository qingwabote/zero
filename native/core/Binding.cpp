#include "Binding.hpp"
#include <typeinfo>

Binding::Binding()
{
}

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
    _js_obj.SetWeak();

    return scope.Escape(obj);
}

v8::Local<v8::Object> Binding::js_props()
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    if (_js_props.IsEmpty())
    {
        _js_props.Reset(isolate, v8::Map::New(isolate));
    }
    return _js_props.Get(isolate);
}

v8::Local<v8::Value> Binding::retain(v8::Local<v8::Value> val, const std::string &key)
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope{isolate};
    v8::Local<v8::Context> context = isolate->GetCurrentContext();

    v8::Local<v8::Map> map = js_props().As<v8::Map>();
    if (key.length())
    {
        map->Set(context, v8::String::NewFromUtf8(isolate, key.c_str()).ToLocalChecked(), val);
    }
    else
    {
        map->Set(context, val, val);
    }
    return val;
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

v8::Local<v8::Object> Binding::retrieve(const std::string &key)
{
    v8::Local<v8::Map> map = js_props().As<v8::Map>();
    return map->Get(v8::Isolate::GetCurrent()->GetCurrentContext(), v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), key.c_str()).ToLocalChecked())
        .ToLocalChecked()
        .As<v8::Object>();
}

Binding::~Binding()
{
    _js_props.Reset();
}
