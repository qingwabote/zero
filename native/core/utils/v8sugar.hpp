#include "v8.h"

using namespace v8;

namespace zero
{
    template <class S>
    Local<S> v8_object_get(Local<Context> context, Local<Object> object, const char *name)
    {
        Local<String> key = String::NewFromUtf8(context->GetIsolate(), name).ToLocalChecked();
        Maybe<bool> maybeExist = object->Has(context, key);
        if (maybeExist.IsNothing())
        {
            return Local<S>();
        }
        if (!maybeExist.FromJust())
        {
            return Local<S>();
        }
        MaybeLocal<Value> maybeValue = object->Get(context, key);
        if (maybeValue.IsEmpty())
        {
            return Local<S>();
        }
        return maybeValue.ToLocalChecked().As<S>();
    }
}