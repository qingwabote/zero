#pragma once

#include "v8.h"
#include <unordered_map>
namespace _v8 = v8;

namespace sugar
{
    namespace v8
    {
        typedef std::unique_ptr<_v8::Isolate, void (*)(_v8::Isolate *)> unique_isolate;
        unique_isolate initWithIsolate();

        std::unordered_map<std::string, _v8::Global<_v8::FunctionTemplate>> *isolate_getConstructorCache(_v8::Isolate *isolate);

        std::string stackTrace_toString(_v8::Local<_v8::StackTrace> stack);

        void isolate_promiseRejectCallback(_v8::PromiseRejectMessage msg);

        _v8::MaybeLocal<_v8::Module> module_resolve(
            _v8::Local<_v8::Context> context,
            _v8::Local<_v8::String> specifier,
            _v8::Local<_v8::FixedArray> import_assertions = _v8::Local<_v8::FixedArray>(),
            _v8::Local<_v8::Module> referrer = _v8::Local<_v8::Module>());

        _v8::MaybeLocal<_v8::Module> module_evaluate(_v8::Local<_v8::Context> context, _v8::Local<_v8::String> specifier);

        template <class S>
        _v8::Local<S> object_get(_v8::Local<_v8::Context> context, _v8::Local<_v8::Object> object, const char *name)
        {
            _v8::EscapableHandleScope handleScope(context->GetIsolate());

            _v8::Local<_v8::String> key = _v8::String::NewFromUtf8(context->GetIsolate(), name).ToLocalChecked();
            _v8::Maybe<bool> maybeExist = object->Has(context, key);
            if (maybeExist.IsNothing())
            {
                return {};
            }
            if (!maybeExist.FromJust())
            {
                return {};
            }
            _v8::MaybeLocal<_v8::Value> maybeValue = object->Get(context, key);
            if (maybeValue.IsEmpty())
            {
                return {};
            }
            return handleScope.Escape(maybeValue.ToLocalChecked().As<S>());
        }

        // template <class S>
        // void v8_object_set(_v8::Local<_v8::Context> context, _v8::Local<_v8::Object> object, const char *name, _v8::Local<S> value)
        // {
        //     _v8::HandleScope handleScope(context->GetIsolate());

        //     _v8::Local<_v8::String> key = _v8::String::NewFromUtf8(context->GetIsolate(), name).ToLocalChecked();
        //     _v8::Maybe<bool> ok = object->Set(context, key, value);
        //     if (ok.IsNothing())
        //     {
        //         throw "v8_object_set failed";
        //     }
        // }

        void setWeakCallback(_v8::Isolate *isolate, _v8::Local<_v8::Data> obj, std::function<void()> &&cb);

        void gc(_v8::Local<_v8::Context> context);

        class Class
        {
        private:
            _v8::Isolate *_isolate = nullptr;
            _v8::Global<_v8::FunctionTemplate> _functionTemplate;

        public:
            Class(_v8::Isolate *isolate, const char *name);

            void defineFunction(const char *name, _v8::FunctionCallback callback);

            void defineAccessor(const char *name, _v8::AccessorNameGetterCallback getter, _v8::AccessorNameSetterCallback setter = nullptr);

            _v8::Local<_v8::FunctionTemplate> flush();

            ~Class();
        };
    }
}