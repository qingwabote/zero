#pragma once

#include "SDL_video.h"
#include "Capabilities.hpp"
#include "Buffer.hpp"
#include "Texture.hpp"
#include "Sampler.hpp"
#include "Shader.hpp"
#include "RenderPass.hpp"
#include "Framebuffer.hpp"
#include "DescriptorSetLayout.hpp"
#include "InputAssembler.hpp"
#include "Pipeline.hpp"
#include "PipelineLayout.hpp"
#include "CommandBuffer.hpp"
#include "Fence.hpp"
#include "Semaphore.hpp"
#include "Queue.hpp"
#include "Swapchain.hpp"

namespace binding::gfx
{
    class Device_impl;

    class Device
    {
    private:
        std::unique_ptr<Capabilities> _capabilities;

        std::unique_ptr<Swapchain> _swapchain;

        std::unique_ptr<Queue> _queue;

    protected:
        Device_impl *_impl{nullptr};

    public:
        Capabilities &capabilities() { return *_capabilities; }
        Swapchain &swapchain() { return *_swapchain; }
        Queue &queue() { return *_queue; }

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

        InputAssembler *createInputAssembler();

        PipelineLayout *createPipelineLayout();

        Pipeline *createPipeline();

        virtual CommandBuffer *createCommandBuffer();

        Semaphore *createSemaphore();

        Fence *createFence();

        virtual Queue *createQueue();

        void acquire(const std::shared_ptr<Semaphore> &presentSemaphore);

        virtual void finish();

        virtual ~Device();
    };
}
