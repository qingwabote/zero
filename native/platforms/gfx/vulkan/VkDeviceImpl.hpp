#pragma once

#include "SDL_vulkan.h"

#include "VkBootstrap.h"

#include "vma/vk_mem_alloc.h"

#include "bindings/gfx/Commandbuffer.hpp"
#include "bindings/gfx/Buffer.hpp"
#include "bindings/gfx/Shader.hpp"
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
            VkRenderPass _renderPass = nullptr;
            std::vector<VkFramebuffer> _framebuffers;

            VmaAllocator _allocator;

            CommandBuffer *_commandBuffer = nullptr;
            v8::Global<v8::Object> _js_commandBuffer;

        public:
            uint32_t version()
            {
                return _version;
            }

            VkDevice device()
            {
                return _vkb_device.device;
            }

            DeviceImpl(SDL_Window *window);

            CommandBuffer *commandBuffer();

            bool initialize();

            Buffer *createBuffer();

            Shader *createShader();

            Pipeline *createPipeline();

            ~DeviceImpl();
        };
    }
}