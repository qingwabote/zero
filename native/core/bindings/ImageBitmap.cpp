#include "ImageBitmap.hpp"

namespace binding
{
    v8::Local<v8::FunctionTemplate> ImageBitmap::createTemplate()
    {
        sugar::v8::Class cls{"ImageBitmap"};
        return cls.flush();
    }
}
