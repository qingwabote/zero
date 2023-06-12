%module Loader

%include "attribute.i"
%include "std_string.i"
%include "std_unique_ptr.i"

%{
#include "Loader.hpp"
%}

%feature("novaluewrapper") std::unique_ptr< char[] >;
%template() std::unique_ptr< char[] >;

%typemap (out, fragment="SWIG_FromCharPtr") std::unique_ptr< char[] > %{
  $result = SWIG_FromCharPtr($1.get());
%}

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

%ignore loader::Result::Result;

%ignore loader::Loader::Loader;
%ignore loader::Loader::instance;

%include "Loader.hpp"

%constant loader::Loader *loader2 = &loader::Loader::instance();