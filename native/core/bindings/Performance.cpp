#include "Performance.hpp"
#include "sugars/v8sugar.hpp"
#include <chrono>

namespace binding
{
    v8::Local<v8::FunctionTemplate> Performance::createTemplate()
    {
        sugar::v8::Class cls{"Performance"};
        cls.defineFunction(
            "now",
            [](const v8::FunctionCallbackInfo<v8::Value> &info)
            {
                auto micro = std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::steady_clock::now().time_since_epoch()).count();
                info.GetReturnValue().Set(static_cast<double>(micro) * 0.001);
            });
        return cls.flush();
    }
}