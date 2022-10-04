#pragma once

#include "Binding.hpp"
#include "SDL_video.h"
#include "Buffer.hpp"
#include "Texture.hpp"
#include "Shader.hpp"
#include "DescriptorSetLayout.hpp"
#include "DescriptorSet.hpp"
#include "Pipeline.hpp"
#include "PipelineLayout.hpp"
#include "CommandBuffer.hpp"

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
            v8::Local<v8::Object> capabilities();

            Device(SDL_Window *window);

            bool initialize();

            Buffer *createBuffer();

            Texture *createTexture();

            Shader *createShader();

            DescriptorSetLayout *createDescriptorSetLayout();

            DescriptorSet *createDescriptorSet();

            PipelineLayout *createPipelineLayout();

            Pipeline *createPipeline();

            CommandBuffer *createCommandBuffer();

            void present(CommandBuffer *commandBuffer);

            ~Device();
        };
    }
}
