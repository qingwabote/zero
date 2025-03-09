%module Loop

%include "stdint.i"
%include "std_shared_ptr.i"
%include "std_vector.i"

%shared_ptr(Touch)
%shared_ptr(TouchVector)
%shared_ptr(TouchEvent)
%shared_ptr(WheelEvent)

%{
#include "events.hpp"
%}
%include "events.hpp"

%template(TouchVector) std::vector<std::shared_ptr<Touch>>;

%typemap(in) std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> && (std::unique_ptr<bastard::Lambda<void, std::shared_ptr<TouchEvent>>> out){
    auto js_func = $input.As<v8::Function>();
    v8::Global<v8::Function> js_g_func(v8::Isolate::GetCurrent(), js_func);
    out = bastard::take_lambda(
        [js_g_func = std::move(js_g_func)](std::shared_ptr<TouchEvent> event) mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          auto js_event = SWIG_NewPointerObj(event, $descriptor(TouchEvent *), 0);
          v8::Local<v8::Value> args[] = {js_event};
          js_g_func.Get(isolate)->Call(context, context->Global(), 1, args);
        });
    $1 = &out;
}

%typemap(in) std::unique_ptr<bastard::Lambda<void, std::shared_ptr<WheelEvent>>> && (std::unique_ptr<bastard::Lambda<void, std::shared_ptr<WheelEvent>>> out){
    auto js_func = $input.As<v8::Function>();
    v8::Global<v8::Function> js_g_func(v8::Isolate::GetCurrent(), js_func);
    out = bastard::take_lambda(
        [js_g_func = std::move(js_g_func)](std::shared_ptr<WheelEvent> event) mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          auto js_event = SWIG_NewPointerObj(event, $descriptor(WheelEvent *), 0);
          v8::Local<v8::Value> args[] = {js_event};
          js_g_func.Get(isolate)->Call(context, context->Global(), 1, args);
        });
    $1 = &out;
}

%typemap(in) std::unique_ptr<bastard::Lambda<void>> && (std::unique_ptr<bastard::Lambda<void>> out){
    auto js_func = $input.As<v8::Function>();
    v8::Global<v8::Function> js_g_func(v8::Isolate::GetCurrent(), js_func);
    out = bastard::take_lambda(
        [js_g_func = std::move(js_g_func)]() mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          js_g_func.Get(isolate)->Call(context, context->Global(), 0, nullptr);
        });
    $1 = &out;
}

%ignore zero::Loop::service;

%import "base/TaskRunner.hpp"
%{
#include "Loop.hpp"
%}
%include "Loop.hpp"
