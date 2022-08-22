#pragma once

#include "sugars/v8sugar.hpp"
#include "sugars/sdlsugar.hpp"

namespace binding
{
    namespace gfx
    {
        void device_constructor(const v8::FunctionCallbackInfo<v8::Value> &info);

        void device_initialize(const v8::FunctionCallbackInfo<v8::Value> &info);

        class Device
        {
        private:
            /* data */
        public:
            static v8::Local<v8::FunctionTemplate> constructor(v8::Isolate *isolate);

            Device(SDL_Window *window);

            bool initialize();

            ~Device();
        };
    }
}
