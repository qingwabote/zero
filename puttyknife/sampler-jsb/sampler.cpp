#include <puttyknife/sampler.hpp>

extern "C" void puttyknife_sampler_swig_initialize(v8::Local<v8::Object> exports_obj);

namespace puttyknife
{
    void Sampler(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
    {
        puttyknife_sampler_swig_initialize(exports_obj);
    }
}
