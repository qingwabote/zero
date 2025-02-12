#include <puttyknife/spi.hpp>

extern "C" void puttyknife_spi_swig_initialize(v8::Local<v8::Object> exports_obj);

namespace puttyknife
{
    // namespace spi
    // {
    //     void callbacks(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj);
    // }

    void Spi(v8::Local<v8::Context> context, v8::Local<v8::Object> exports_obj)
    {
        puttyknife_spi_swig_initialize(exports_obj);

        // spi::callbacks(context, exports_obj);
    }
}
