#pragma once

#include "volk/volk.h"

#include "SDL_vulkan.h"

#include "VkBootstrap.h"

#include "vma/vk_mem_alloc.h"

namespace binding::gfx
{
    class Device_impl
    {
    private:
        SDL_Window *_window{nullptr};
        vkb::Instance _vkb_instance;
        VkSurfaceKHR _surface{nullptr};
        vkb::PhysicalDevice _vkb_physicalDevice;
        vkb::Device _vkb_device;

        VmaAllocator _allocator{nullptr};

        VkCommandPool _commandPool{nullptr};

        vkb::Swapchain _vkb_swapchain;
        std::vector<VkImageView> _swapchainImageViews;

        uint32_t _swapchainImageIndex = 0;

        VkQueue _graphicsQueue{nullptr};

    public:
        uint32_t version() { return VK_API_VERSION_1_3; }

        VkPhysicalDeviceLimits &limits() { return _vkb_physicalDevice.properties.limits; }

        VkCommandPool commandPool() { return _commandPool; }

        VmaAllocator allocator() { return _allocator; }

        VkSwapchainKHR swapchain() { return _vkb_swapchain.swapchain; }

        std::vector<VkImageView> &swapchainImageViews() { return _swapchainImageViews; }

        VkFormat swapchainImageFormat() { return _vkb_swapchain.image_format; }

        VkExtent2D &swapchainImageExtent() { return _vkb_swapchain.extent; }

        uint32_t swapchainImageIndex() { return _swapchainImageIndex; }

        VkQueue graphicsQueue() { return _graphicsQueue; }

        VkDevice device() { return _vkb_device.device; }

        operator VkDevice() { return _vkb_device.device; }

        Device_impl(SDL_Window *window) : _window(window) {}

        bool initialize();

        void acquireNextImage(VkSemaphore semaphore);

        ~Device_impl();
    };
}
