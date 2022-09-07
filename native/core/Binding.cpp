#include "Binding.hpp"
#include <typeinfo>
#include "sugars/v8sugar.hpp"

Binding::Binding()
{
}

v8::Local<v8::Object> Binding::js()
{
    v8::Isolate *isolate = v8::Isolate::GetCurrent();
    if (!_js.IsEmpty())
    {
        return _js.Get(isolate);
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

    _js.Reset(isolate, obj);
    _js.SetWeak();

    return scope.Escape(obj);
}

Binding::~Binding()
{
    _js.Reset();
}