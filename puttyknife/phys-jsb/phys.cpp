#include <puttyknife/phys.hpp>

extern "C" void puttyknife_phys_swig_initialize(v8::Local<v8::Object> exports_obj);

namespace puttyknife
{
    namespace phys
    {
        void callbacks(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj);
    }

    void Phys(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
    {
        puttyknife_phys_swig_initialize(exports_obj);

        phys::callbacks(context, exports_obj);
    }
}
