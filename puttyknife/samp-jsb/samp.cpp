#include <puttyknife/samp.hpp>

extern "C" void puttyknife_samp_swig_initialize(v8::Local<v8::Object> exports_obj);

namespace puttyknife
{
    void Samp(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
    {
        puttyknife_samp_swig_initialize(exports_obj);
    }
}
