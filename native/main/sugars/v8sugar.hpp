#pragma once

#include "v8/v8.h"
#include <unordered_map>
#include <filesystem>

namespace _v8 = v8;
namespace sugar::v8
{
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

    std::string stackTrace_toString(_v8::Local<_v8::StackTrace> stack);

    void tryCatch_print(_v8::TryCatch &tryCatch);

    typedef std::unique_ptr<_v8::Isolate, void (*)(_v8::Isolate *)> unique_isolate;
    unique_isolate isolate_create(std::filesystem::path &imports);

    _v8::Local<_v8::Object> isolate_native2js_get(_v8::Isolate *isolate, void *ptr);

    void isolate_native2js_set(_v8::Isolate *isolate, void *ptr, _v8::Local<_v8::Object> obj);

    void isolate_promiseRejectCallback(_v8::PromiseRejectMessage msg);

    _v8::MaybeLocal<_v8::Module> module_resolve(
        _v8::Local<_v8::Context> context,
        _v8::Local<_v8::String> specifier,
        _v8::Local<_v8::FixedArray> import_assertions = _v8::Local<_v8::FixedArray>(),
        _v8::Local<_v8::Module> referrer = _v8::Local<_v8::Module>());

    void module_evaluate(_v8::Local<_v8::Context> context, std::filesystem::path &path, _v8::Local<_v8::Promise> *promise, _v8::Local<_v8::Module> *module = nullptr);

    _v8::Local<_v8::Value> object_get(_v8::Local<_v8::Object> object, const char *name);

    void object_set(_v8::Local<_v8::Object> object, const char *name, _v8::Local<_v8::Value> value);

    const _v8::String::Utf8Value &object_toString(_v8::Local<_v8::Object> object);

    void gc(_v8::Local<_v8::Context> context);

    _v8::Local<_v8::Value> run(const char *source);
}
