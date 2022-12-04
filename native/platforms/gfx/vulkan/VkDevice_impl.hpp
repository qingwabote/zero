#pragma once

#include "SDL_vulkan.h"

#include "VkBootstrap.h"

#include "vma/vk_mem_alloc.h"

#include "bindings/gfx/CommandBuffer.hpp"
#include "bindings/gfx/Buffer.hpp"
#include "bindings/gfx/Shader.hpp"
#include "bindings/gfx/DescriptorSetLayout.hpp"
#include "bindings/gfx/DescriptorSet.hpp"
#include "bindings/gfx/Pipeline.hpp"

namespace binding
{
    namespace gfx
    {
        class Device_impl
        {
            friend class Device;

        private:
            uint32_t _version;

            SDL_Window *_window = nullptr;
            vkb::Instance _vkb_instance;
            VkSurfaceKHR _surface = nullptr;
            vkb::Device _vkb_device;

            VmaAllocator _allocator;

            vkb::Swapchain _vkb_swapchain;
            std::vector<VkImageView> _swapchainImageViews;

            VkCommandPool _commandPool = nullptr;
            VkDescriptorPool _descriptorPool = nullptr;

            VkQueue _graphicsQueue = nullptr;

            uint32_t _swapchainImageIndex = 0;

        public:
            uint32_t version() { return _version; }

            VkCommandPool commandPool() { return _commandPool; }

            VkDescriptorPool descriptorPool() { return _descriptorPool; }

            VmaAllocator allocator() { return _allocator; }

            std::vector<VkImageView> &swapchainImageViews() { return _swapchainImageViews; }

            VkFormat swapchainImageFormat() { return _vkb_swapchain.image_format; }

            VkExtent2D &swapchainImageExtent() { return _vkb_swapchain.extent; }

            uint32_t swapchainImageIndex() { return _swapchainImageIndex; }

            operator VkDevice() { return _vkb_device.device; }

            Device_impl(SDL_Window *window) : _window(window) {}

            ~Device_impl() {}
        };
    }
}