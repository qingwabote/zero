%module Loader

%include "attribute.i"
%include "std_string.i"
%include "std_unique_ptr.i"

%{
#include "Loader.hpp"
%}

// Result
%unique_ptr(ImageBitmap)

%attribute(loader::Result, std::string, error, error);

%ignore loader::Result::Result;

// Loader
%typemap(in) UniqueFunction<void, std::unique_ptr<loader::Result>> && (UniqueFunction<void, std::unique_ptr<loader::Result>> temp){
    auto js_func = $input.As<v8::Function>();
    v8::Global<v8::Function> js_g_func(v8::Isolate::GetCurrent(), js_func);
    auto c_func = new auto(
        [js_g_func = std::move(js_g_func)](std::unique_ptr<loader::Result> res) mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          auto js_res = SWIG_NewPointerObj(res.release(), $descriptor(loader::Result *), SWIG_POINTER_OWN);
          v8::Local<v8::Value> args[] = {js_res};
          js_g_func.Get(isolate)->Call(context, context->Global(), 1, args);
        });
    temp = std::move(UniqueFunction<void, std::unique_ptr<loader::Result>>::create(c_func));
    $1 = &temp;
}

%ignore loader::Loader::Loader;
%ignore loader::Loader::instance;

%rename(_load) loader::Loader::load;

%include "Loader.hpp"
