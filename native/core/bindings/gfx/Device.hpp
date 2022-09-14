#pragma once

#include "Binding.hpp"
#include "SDL_video.h"
#include "Buffer.hpp"
#include "Shader.hpp"
#include "DescriptorSetLayout.hpp"
#include "DescriptorSet.hpp"
#include "Pipeline.hpp"

namespace binding
{
    namespace gfx
    {
        class Device_impl;

        class Device : public Binding
        {
        private:
            Device_impl *_impl = nullptr;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Device(SDL_Window *window);

            v8::Local<v8::Object> commandBuffer();

            bool initialize();

            Buffer *createBuffer();

            Shader *createShader();

            DescriptorSetLayout *createDescriptorSetLayout();

            DescriptorSet *createDescriptorSet();

            Pipeline *createPipeline();

            void present();

            ~Device();
        };
    }
}
