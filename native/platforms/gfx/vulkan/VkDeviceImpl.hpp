#pragma once

#include "SDL_vulkan.h"

#include "VkBootstrap.h"

#include "vma/vk_mem_alloc.h"

#include "bindings/gfx/Commandbuffer.hpp"
#include "bindings/gfx/Buffer.hpp"
#include "bindings/gfx/Shader.hpp"
#include "bindings/gfx/DescriptorSetLayout.hpp"
#include "bindings/gfx/DescriptorSet.hpp"
#include "bindings/gfx/Pipeline.hpp"

namespace binding
{
    namespace gfx
    {
        class DeviceImpl
        {
        private:
            uint32_t _version;

            SDL_Window *_window = nullptr;
            vkb::Instance _vkb_instance;
            VkSurfaceKHR _surface = nullptr;
            vkb::Device _vkb_device;

            vkb::Swapchain _vkb_swapchain;
            std::vector<VkImageView> _swapchainImageViews;

            VkQueue _graphicsQueue = nullptr;
            VkCommandPool _commandPool = nullptr;
            VkDescriptorPool _descriptorPool = nullptr;
            VkRenderPass _renderPass = nullptr;
            std::vector<VkFramebuffer> _framebuffers;

            VmaAllocator _allocator;

            CommandBuffer *_commandBuffer = nullptr;
            v8::Global<v8::Object> _js_commandBuffer;

            VkFence _renderFence = nullptr;
            VkSemaphore _presentSemaphore = nullptr;
            VkSemaphore _renderSemaphore = nullptr;

            uint32_t _swapchainImageIndex = 0;

        public:
            uint32_t version() { return _version; }

            VkDevice device() { return _vkb_device.device; }

            VkCommandPool commandPool() { return _commandPool; }

            VkDescriptorPool descriptorPool() { return _descriptorPool; }

            VkRenderPass renderPass() { return _renderPass; }

            VkFence renderFence() { return _renderFence; }
            VkSemaphore presentSemaphore() { return _presentSemaphore; }
            VkSemaphore renderSemaphore() { return _renderSemaphore; }

            // uint32_t swapchainImageIndex() { return _swapchainImageIndex; }

            // const std::vector<VkFramebuffer> &framebuffers() { return _framebuffers; }

            VkFramebuffer curFramebuffer() { return _framebuffers[_swapchainImageIndex]; }

            DeviceImpl(SDL_Window *window);

            CommandBuffer *commandBuffer();

            bool initialize();

            Buffer *createBuffer();

            Shader *createShader();

            DescriptorSetLayout *createDescriptorSetLayout();

            DescriptorSet *createDescriptorSet();

            Pipeline *createPipeline();

            void present();

            ~DeviceImpl();
        };
    }
}