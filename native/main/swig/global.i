%module global

%include "std_shared_ptr.i"
%include "std_vector.i"

%{
#include "Window.hpp"
%}

%{
static loader::Loader * Window_instance_loader() {
  return &Window::instance().loader();
}
static binding::gfx::Device * Window_instance_device() {
  return &Window::instance().device();
}

void SWIGV8_DeletePrivateData(SWIGV8_OBJECT objRef) {
  SWIGV8_Proxy *cdata = static_cast<SWIGV8_Proxy *>(objRef->GetAlignedPointerFromInternalField(0));
  void *embedder_fields[] = {nullptr, nullptr};
  v8::WeakCallbackInfo<SWIGV8_Proxy> callbackInfo{objRef->GetIsolate(), cdata, embedder_fields, nullptr};
  static_cast<SWIGV8_ClientData *>(cdata->info->clientdata)->dtor(callbackInfo);
}
%}

%constant loader::Loader *loader = Window_instance_loader();
%constant binding::gfx::Device *device = Window_instance_device();
