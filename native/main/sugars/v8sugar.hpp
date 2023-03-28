#pragma once

#include "v8.h"
#include <unordered_map>

namespace _v8 = v8;
namespace sugar::v8
{
    typedef std::unique_ptr<_v8::Isolate, void (*)(_v8::Isolate *)> unique_isolate;
    unique_isolate initWithIsolate();

    std::unordered_map<std::string, _v8::Global<_v8::FunctionTemplate>> *isolate_getConstructorCache(_v8::Isolate *isolate);

    std::string stackTrace_toString(_v8::Local<_v8::StackTrace> stack);

    void tryCatch_print(_v8::TryCatch &tryCatch);

    void isolate_promiseRejectCallback(_v8::PromiseRejectMessage msg);

    _v8::MaybeLocal<_v8::Module> module_resolve(
        _v8::Local<_v8::Context> context,
        _v8::Local<_v8::String> specifier,
        _v8::Local<_v8::FixedArray> import_assertions = _v8::Local<_v8::FixedArray>(),
        _v8::Local<_v8::Module> referrer = _v8::Local<_v8::Module>());

    _v8::MaybeLocal<_v8::Module> module_evaluate(_v8::Local<_v8::Context> context, _v8::Local<_v8::String> specifier);

    _v8::Local<_v8::Value> object_get(_v8::Local<_v8::Object> object, const char *name);

    void object_set(_v8::Local<_v8::Object> object, const char *name, _v8::Local<_v8::Value> value);

    _v8::String::Utf8Value &object_toString(_v8::Local<_v8::Object> object);

    void setWeakCallback(_v8::Local<_v8::Data> obj, std::function<void()> &&cb);

    void gc(_v8::Local<_v8::Context> context);

    _v8::Local<_v8::Value> run(const char *source);

    class Class
    {
    private:
        _v8::Global<_v8::FunctionTemplate> _functionTemplate;

    public:
        Class(const char *name);

        void defineFunction(const char *name, _v8::FunctionCallback callback);

        void defineAccessor(const char *name, _v8::AccessorNameGetterCallback getter, _v8::AccessorNameSetterCallback setter = nullptr);

        _v8::Local<_v8::FunctionTemplate> flush();
    };

    template <class T>
    class Weak
    {
    private:
        _v8::Global<T> _global;

    public:
        inline bool IsEmpty() const { return _global.IsEmpty(); }

        Weak() {}

        Weak(_v8::Isolate *isolate, _v8::Local<T> that)
        {
            _global.Reset(isolate, that);
            _global.SetWeak();
        }

        inline _v8::Local<T> Get(_v8::Isolate *isolate) const
        {
            return _global.Get(isolate);
        }

        inline void Reset(_v8::Isolate *isolate, const _v8::Local<T> &that)
        {
            _global.Reset(isolate, that);
            _global.SetWeak();
        }

        inline bool operator==(const Weak<T> &that) const
        {
            return _global == that._global;
        }
    };
}
