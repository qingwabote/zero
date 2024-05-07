%module Window

%include "stdint.i"
%include "std_shared_ptr.i"
%include "std_vector.i"

%{
#include "Window.hpp"
%}

%shared_ptr(Touch)
%shared_ptr(TouchVector)
%shared_ptr(TouchEvent)
%shared_ptr(WheelEvent)

%include "events.hpp"

%template(TouchVector) std::vector<std::shared_ptr<Touch>>;

%{
void SWIGV8_DeletePrivateData(SWIGV8_OBJECT objRef) {
  SWIGV8_Proxy *cdata = static_cast<SWIGV8_Proxy *>(objRef->GetAlignedPointerFromInternalField(0));
  void *embedder_fields[] = {nullptr, nullptr};
  v8::WeakCallbackInfo<SWIGV8_Proxy> callbackInfo{objRef->GetIsolate(), cdata, embedder_fields, nullptr};
  static_cast<SWIGV8_ClientData *>(cdata->info->clientdata)->dtor(callbackInfo);
}
%}

%typemap(in) std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> && (std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> temp){
    auto js_func = $input.As<v8::Function>();
    v8::Global<v8::Function> js_g_func(v8::Isolate::GetCurrent(), js_func);
    auto c_func = new auto(
        [js_g_func = std::move(js_g_func)](std::shared_ptr<TouchEvent> event) mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          auto js_event = SWIG_NewPointerObj(event, $descriptor(TouchEvent *), 0);
          v8::Local<v8::Value> args[] = {js_event};
          js_g_func.Get(isolate)->Call(context, context->Global(), 1, args);
        });
    temp.reset(new callable::CallableLambda(c_func));
    $1 = &temp;
}

%typemap(in) std::unique_ptr<callable::Callable<void, std::shared_ptr<WheelEvent>>> && (std::unique_ptr<callable::Callable<void, std::shared_ptr<WheelEvent>>> temp){
    auto js_func = $input.As<v8::Function>();
    v8::Global<v8::Function> js_g_func(v8::Isolate::GetCurrent(), js_func);
    auto c_func = new auto(
        [js_g_func = std::move(js_g_func)](std::shared_ptr<WheelEvent> event) mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          auto js_event = SWIG_NewPointerObj(event, $descriptor(WheelEvent *), 0);
          v8::Local<v8::Value> args[] = {js_event};
          js_g_func.Get(isolate)->Call(context, context->Global(), 1, args);
        });
    temp.reset(new callable::CallableLambda(c_func));
    $1 = &temp;
}

%typemap(in) std::unique_ptr<callable::Callable<void>> && (std::unique_ptr<callable::Callable<void>> temp){
    auto js_func = $input.As<v8::Function>();
    v8::Global<v8::Function> js_g_func(v8::Isolate::GetCurrent(), js_func);
    auto c_func = new auto(
        [js_g_func = std::move(js_g_func)]() mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          js_g_func.Get(isolate)->Call(context, context->Global(), 0, nullptr);
        });
    temp.reset(new callable::CallableLambda(c_func));
    $1 = &temp;
}

%import "base/TaskRunner.hpp"

%ignore Window::Window;
%ignore Window::loop;

%include "Window.hpp"
