#include "Binding.hpp"
#include <typeinfo>

Binding::Binding(v8::Isolate *isolate)
{
    _isolate = isolate;
}

v8::Local<v8::Object> Binding::js()
{
    if (!_js.IsEmpty())
    {
        return _js.Get(_isolate);
    }

    v8::EscapableHandleScope scope(_isolate);
    auto context = _isolate->GetCurrentContext();

    v8::Local<v8::FunctionTemplate> constructor;
    auto cache = sugar::v8::isolate_getConstructorCache(_isolate);
    auto key = typeid(*this).name();
    auto it = cache->find(key);
    if (it == cache->end())
    {
        constructor = cache->emplace(key, v8::Global<v8::FunctionTemplate>{_isolate, createTemplate()}).first->second.Get(_isolate);
    }
    else
    {
        constructor = it->second.Get(_isolate);
    }

    v8::Local<v8::Object> obj = constructor->GetFunction(context).ToLocalChecked()->NewInstance(context).ToLocalChecked();
    obj->SetAlignedPointerInInternalField(0, this);

    sugar::v8::setWeakCallback(_isolate, obj, [this]()
                               { delete this; });

    _js.Reset(_isolate, obj);
    _js.SetWeak();

    return scope.Escape(obj);
}

Binding::~Binding()
{
    _js.Reset();
}