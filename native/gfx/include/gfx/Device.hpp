#pragma once

#include <functional>
#include "SDL_video.h"
#include "Capabilities.hpp"
#include "info.hpp"
#include "Buffer.hpp"
#include "Texture.hpp"
#include "Sampler.hpp"
#include "Shader.hpp"
#include "RenderPass.hpp"
#include "Framebuffer.hpp"
#include "DescriptorSetLayout.hpp"
#include "Pipeline.hpp"
#include "PipelineLayout.hpp"
#include "CommandBuffer.hpp"
#include "Fence.hpp"
#include "Semaphore.hpp"
#include "Queue.hpp"
#include "Swapchain.hpp"

namespace gfx
{
    class DeviceImpl;

    class Device
    {
    private:
        std::unique_ptr<Capabilities> _capabilities;

        std::unique_ptr<Swapchain> _swapchain;

        std::unique_ptr<Queue> _queue;

    protected:
        DeviceImpl *_impl{nullptr};

        virtual std::unique_ptr<Queue> getQueue();

    public:
        Capabilities &capabilities() { return *_capabilities; }
        Swapchain &swapchain() { return *_swapchain; }
        Queue &queue() { return *_queue; }

        Device(SDL_Window *window, std::function<void()> &&debugMessengerCallback);

        bool initialize();

        Buffer *createBuffer(const std::shared_ptr<BufferInfo> &info);
        virtual CommandBuffer *createCommandBuffer();
        DescriptorSet *createDescriptorSet(const std::shared_ptr<DescriptorSetLayout> &layout);
        DescriptorSetLayout *createDescriptorSetLayout(const std::shared_ptr<DescriptorSetLayoutInfo> &info);
        Fence *createFence(bool signaled = false);
        Framebuffer *createFramebuffer(const std::shared_ptr<FramebufferInfo> &info);
        Pipeline *createPipeline(const std::shared_ptr<PipelineInfo> &info);
        PipelineLayout *createPipelineLayout(const std::shared_ptr<PipelineLayoutInfo> &info);
        RenderPass *createRenderPass(const std::shared_ptr<RenderPassInfo> &info);
        Sampler *createSampler(const std::shared_ptr<SamplerInfo> &info);
        Semaphore *createSemaphore();
        Shader *createShader(const std::shared_ptr<ShaderInfo> &info);
        Texture *createTexture(const std::shared_ptr<TextureInfo> &info);

        virtual void waitForFence(const std::shared_ptr<Fence> &fence);

        virtual void finish();

        virtual ~Device();
    };
}
