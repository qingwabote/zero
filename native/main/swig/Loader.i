%module Loader

%include "attribute.i"
%include "std_string.i"
%include "stdint.i"
%include "std_unique_ptr.i"
%include "std_shared_ptr.i"

%{
#include "Loader.hpp"
%}

// Result
%unique_ptr(ImageBitmap)

%ignore loader::Result::Result;

// Loader
%typemap(in) loader::LoaderCallback && (loader::LoaderCallback out){
    v8::Global<v8::Function> js_func(v8::Isolate::GetCurrent(), $input.As<v8::Function>());
    out = bastard::take_lambda(
        [js_func = std::move(js_func)](std::unique_ptr<loader::Result> res) mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          v8::Local<v8::Value> args[] = {SWIG_NewPointerObj(res.release(), $descriptor(loader::Result *), SWIG_POINTER_OWN)};
          js_func.Get(isolate)->Call(context, context->Global(), std::size(args), args).ToLocalChecked();
        });
    $1 = &out;
}

%ignore loader::Loader::Loader;

%attribute(loader::Loader, uint32_t, taskCount, taskCount);

%include "Loader.hpp"
