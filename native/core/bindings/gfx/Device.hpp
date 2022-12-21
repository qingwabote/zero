#pragma once

#include "Binding.hpp"
#include "SDL_video.h"
#include "Buffer.hpp"
#include "Texture.hpp"
#include "Sampler.hpp"
#include "Shader.hpp"
#include "RenderPass.hpp"
#include "Framebuffer.hpp"
#include "DescriptorSetLayout.hpp"
#include "DescriptorSet.hpp"
#include "Pipeline.hpp"
#include "PipelineLayout.hpp"
#include "CommandBuffer.hpp"
#include "Fence.hpp"
#include "Semaphore.hpp"
#include "Queue.hpp"

namespace binding::gfx
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

        bool initialize();

        Buffer *createBuffer();

        Texture *createTexture();

        Sampler *createSampler();

        Shader *createShader();

        RenderPass *createRenderPass();

        Framebuffer *createFramebuffer();

        DescriptorSetLayout *createDescriptorSetLayout();

        DescriptorSet *createDescriptorSet();

        PipelineLayout *createPipelineLayout();

        Pipeline *createPipeline();

        CommandBuffer *createCommandBuffer();

        Semaphore *createSemaphore();

        Fence *createFence();

        void acquire(Semaphore *presentSemaphore);

        void waitIdle();

        ~Device();
    };
}
