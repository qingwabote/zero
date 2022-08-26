#pragma once

#include "Binding.hpp"
#include "sugars/sdlsugar.hpp"
#include "CommandBuffer.hpp"
#include "Pipeline.hpp"

namespace binding
{
    namespace gfx
    {
        class Device : public Binding
        {
        private:
            class Impl;
            Impl *_impl = nullptr;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Device(v8::Isolate *isolate, SDL_Window *window);

            CommandBuffer *commandBuffer();

            bool initialize();

            Pipeline *createPipeline();

            ~Device();
        };
    }
}
