#pragma once

#include <vector>
#include "volk/volk.h"
#include "SDL_vulkan.h"
#include "vma/vk_mem_alloc.h"
#include "SwapchainImpl.hpp"

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

        VmaAllocator _allocator{nullptr};

        VkCommandPool _commandPool{nullptr};

        VkQueue _graphicsQueue{nullptr};

        SwapchainImpl *_swapchain{nullptr};

    public:
        uint32_t version() { return VK_API_VERSION_1_3; }

        VkPhysicalDeviceLimits &limits() { return _gpuProperties.limits; }

        SwapchainImpl *swapchain() { return _swapchain; }

        VkQueue graphicsQueue() { return _graphicsQueue; }

        VkCommandPool commandPool() { return _commandPool; }

        VmaAllocator allocator() { return _allocator; }

        VkDevice device() { return _device; }

        operator VkDevice() { return _device; }

        DeviceImpl(SDL_Window *window) : _window(window) {}

        bool initialize();

        ~DeviceImpl();
    };
}
