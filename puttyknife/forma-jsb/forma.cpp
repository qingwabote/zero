#include <puttyknife/forma.hpp>

extern "C" void puttyknife_forma_swig_initialize(v8::Local<v8::Object> exports_obj);

namespace puttyknife
{
    void Forma(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
    {
        puttyknife_forma_swig_initialize(exports_obj);
    }
}
