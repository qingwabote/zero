#include <puttyknife/yoga/js.hpp>

extern "C" void puttyknife_yoga_swig_initialize(v8::Local<v8::Object> exports_obj);

void puttyknife_yoga_callbacks(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj);

void puttyknife_yoga_js(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
{
    puttyknife_yoga_swig_initialize(exports_obj);

    puttyknife_yoga_callbacks(context, exports_obj);
}
