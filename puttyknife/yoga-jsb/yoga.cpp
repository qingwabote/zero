#include <puttyknife/yoga.hpp>

extern "C" void puttyknife_yoga_swig_initialize(v8::Local<v8::Object> exports_obj);

namespace puttyknife
{
    namespace yoga
    {
        void callbacks(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj);
    }

    void Yoga(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
    {
        puttyknife_yoga_swig_initialize(exports_obj);

        yoga::callbacks(context, exports_obj);
    }
}
