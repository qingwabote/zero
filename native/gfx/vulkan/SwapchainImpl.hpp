#pragma once

#include "volk/volk.h"

namespace gfx
{
    class SwapchainImpl
    {
    private:
        VkDevice _device;
        std::vector<VkImageView> _imageViews;
        VkFormat _imageFormat{};
        VkExtent2D _imageExtent{};
        VkSwapchainKHR _swapchain{nullptr};

        uint32_t _imageIndex{0};

    public:
        const std::vector<VkImageView> &imageViews() { return _imageViews; }
        VkFormat imageFormat() { return _imageFormat; }
        VkExtent2D &imageExtent() { return _imageExtent; }
        uint32_t imageIndex() { return _imageIndex; }

        SwapchainImpl(VkDevice device);

        bool initialize(VkPhysicalDevice gpu, VkSurfaceKHR surface);
        void acquire(VkSemaphore semaphore);

        operator VkSwapchainKHR() { return _swapchain; }

        ~SwapchainImpl();
    };
}