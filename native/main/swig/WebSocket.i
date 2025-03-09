%module WebSocket

%include "attribute.i"
%include "std_string.i"
%include "std_unique_ptr.i"
%include "std_shared_ptr.i"

%ignore zero::WebSocketEvent::WebSocketEvent;
%ignore zero::WebSocket;

%typemap(in) zero::WebSocketCallback* (zero::WebSocketCallback out){
    v8::Global<v8::Function> js_func(v8::Isolate::GetCurrent(), $input.As<v8::Function>());
    out = bastard::take_lambda(
        [js_func = std::move(js_func)](std::unique_ptr<zero::WebSocketEvent> res) mutable
        {
          v8::Isolate *isolate = v8::Isolate::GetCurrent();
          v8::Local<v8::Context> context = isolate->GetCurrentContext();
          v8::Local<v8::Value> args[] = {SWIG_NewPointerObj(res.release(), $descriptor(zero::WebSocketEvent *), SWIG_POINTER_OWN)};
          js_func.Get(isolate)->Call(context, context->Global(), std::size(args), args).ToLocalChecked();
        });
    $1 = &out;
}

%attributeval(bg::WebSocket, zero::WebSocketCallback, onopen, onopen, onopen);
%attributeval(bg::WebSocket, zero::WebSocketCallback, onmessage, onmessage, onmessage);
%ignore bg::WebSocket::onopen;
%ignore bg::WebSocket::onmessage;
%unique_ptr(bg::WebSocket)

%{
#include "bg/WebSocket.hpp"
%}
%include "WebSocket.hpp"
%include "bg/WebSocket.hpp"

