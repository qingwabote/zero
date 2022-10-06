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
#include "Fence.hpp"
#include "Semaphore.hpp"

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

            Semaphore *createSemaphore();

            Fence *createFence();

            void acquire(Semaphore *presentSemaphore);

            void submit(v8::Local<v8::Object> info, Fence *fence);

            void present(Semaphore *waitSemaphore);

            void waitFence(Fence *fence);

            void waitIdle();

            ~Device();
        };
    }
}
