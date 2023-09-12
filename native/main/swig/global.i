%module global

%include "stdint.i"
%include "std_shared_ptr.i"
%include "std_vector.i"

%{
#include "Window.hpp"
%}

%shared_ptr(Touch)
%shared_ptr(TouchVector)
%shared_ptr(TouchEvent)

%include "events.hpp"

%template(TouchVector) std::vector<std::shared_ptr<Touch>>;

%{
static loader::Loader * Window_instance_loader() {
  return &Window::instance().loader();
}
static gfx::Device * Window_instance_device() {
  return &Window::instance().device();
}

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

%typemap(in) std::unique_ptr<callable::Callable<void, double>> && (std::unique_ptr<callable::Callable<void, double>> temp){
    auto js_func = $input.As<v8::Function>();
    v8::Global<v8::Function> js_g_func(v8::Isolate::GetCurrent(), js_func);
    auto c_func = new auto(
        [js_g_func = std::move(js_g_func)](double timestamp) mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          v8::Local<v8::Value> args[] = {v8::Number::New(isolate, timestamp)};
          js_g_func.Get(isolate)->Call(context, context->Global(), 1, args);
        });
    temp.reset(new callable::CallableLambda(c_func));
    $1 = &temp;
}

%constant loader::Loader *loader = Window_instance_loader();
%constant gfx::Device *device = Window_instance_device();

%inline %{
void onTouchStart(std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> &&cb) {
  Window::instance().onTouchStart(std::forward<std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>>>(cb));
}
void onTouchMove(std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> &&cb) {
  Window::instance().onTouchMove(std::forward<std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>>>(cb));
}
void onTouchEnd(std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>> &&cb) {
  Window::instance().onTouchEnd(std::forward<std::unique_ptr<callable::Callable<void, std::shared_ptr<TouchEvent>>>>(cb));
}

void requestAnimationFrame(std::unique_ptr<callable::Callable<void, double>> &&cb) {
  Window::instance().requestAnimationFrame(std::forward<std::unique_ptr<callable::Callable<void, double>>>(cb));
}
%}