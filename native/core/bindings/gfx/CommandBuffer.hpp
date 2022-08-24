#pragma once

#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        void commandbuffer_constructor(const v8::FunctionCallbackInfo<v8::Value> &info);

        void commandbuffer_beginRenderPass(const v8::FunctionCallbackInfo<v8::Value> &info);

        class CommandBuffer
        {
        private:
            /* data */
        public:
            static v8::Local<v8::FunctionTemplate> constructor(v8::Isolate *isolate);

            CommandBuffer(SDL_Window *window);

            bool initialize();

            ~CommandBuffer();
        };
    }
}