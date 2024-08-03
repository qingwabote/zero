#pragma once

#include "volk/volk.h"
#include "SDL_vulkan.h"
#include "vma/vk_mem_alloc.h"
#include <vector>

namespace gfx
{
    class DeviceImpl
    {
    private:
        SDL_Window *_window{nullptr};

        VkInstance _instance{nullptr};

        VkSurfaceKHR _surface{nullptr};

        VkDebugUtilsMessengerEXT _debugUtilsMessenger{nullptr};

        VkPhysicalDeviceProperties _gpuProperties{};

        VkDevice _device{nullptr};

        VkFormat _swapchainImageFormat{};
        VkExtent2D _swapchainImageExtent{};
        VkSwapchainKHR _swapchain{nullptr};
        std::vector<VkImageView> _swapchainImageViews;

        VmaAllocator _allocator{nullptr};

        VkCommandPool _commandPool{nullptr};

        uint32_t _swapchainImageIndex{0};

        VkQueue _graphicsQueue{nullptr};

    public:
        uint32_t version() { return VK_API_VERSION_1_3; }

        VkPhysicalDeviceLimits &limits() { return _gpuProperties.limits; }

        VkFormat swapchainImageFormat() { return _swapchainImageFormat; }
        VkExtent2D &swapchainImageExtent() { return _swapchainImageExtent; }
        VkSwapchainKHR swapchain() { return _swapchain; }
        std::vector<VkImageView> &swapchainImageViews() { return _swapchainImageViews; }

        uint32_t swapchainImageIndex() { return _swapchainImageIndex; }

        VkQueue graphicsQueue() { return _graphicsQueue; }

        VkCommandPool commandPool() { return _commandPool; }

        VmaAllocator allocator() { return _allocator; }

        VkDevice device() { return _device; }

        operator VkDevice() { return _device; }

        DeviceImpl(SDL_Window *window) : _window(window) {}

        bool initialize();

        void acquireNextImage(VkSemaphore semaphore);

        ~DeviceImpl();
    };
}
