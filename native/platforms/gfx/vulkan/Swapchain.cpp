#include "gfx/Swapchain.hpp"
#include "gfx/Texture.hpp"
#include "SwapchainImpl.hpp"
#include "SemaphoreImpl.hpp"

namespace gfx
{
    SwapchainImpl::SwapchainImpl(VkDevice device) : _device(device) {}

    bool SwapchainImpl::initialize(VkPhysicalDevice gpu, VkSurfaceKHR surface)
    {
        VkSurfaceCapabilitiesKHR surface_properties;
        vkGetPhysicalDeviceSurfaceCapabilitiesKHR(gpu, surface, &surface_properties);

        uint32_t surface_formatCount = 0U;
        vkGetPhysicalDeviceSurfaceFormatsKHR(gpu, surface, &surface_formatCount, nullptr);
        std::vector<VkSurfaceFormatKHR> surface_formats(surface_formatCount);
        vkGetPhysicalDeviceSurfaceFormatsKHR(gpu, surface, &surface_formatCount, surface_formats.data());

        VkSurfaceFormatKHR &surface_format = surface_formats[0];

        VkSwapchainCreateInfoKHR swapchainInfo{VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR};
        swapchainInfo.surface = surface;
        swapchainInfo.minImageCount = 3;
        swapchainInfo.imageFormat = surface_format.format;
        swapchainInfo.imageColorSpace = surface_format.colorSpace;
        swapchainInfo.imageExtent = surface_properties.currentExtent;
        swapchainInfo.imageArrayLayers = 1;
        swapchainInfo.imageUsage = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;
        swapchainInfo.imageSharingMode = VK_SHARING_MODE_EXCLUSIVE;
        swapchainInfo.preTransform = VK_SURFACE_TRANSFORM_IDENTITY_BIT_KHR;
        if (surface_properties.supportedCompositeAlpha & VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR)
        {
            swapchainInfo.compositeAlpha = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR;
        }
        else if (surface_properties.supportedCompositeAlpha & VK_COMPOSITE_ALPHA_PRE_MULTIPLIED_BIT_KHR)
        {
            swapchainInfo.compositeAlpha = VK_COMPOSITE_ALPHA_PRE_MULTIPLIED_BIT_KHR;
        }
        else if (surface_properties.supportedCompositeAlpha & VK_COMPOSITE_ALPHA_POST_MULTIPLIED_BIT_KHR)
        {
            swapchainInfo.compositeAlpha = VK_COMPOSITE_ALPHA_POST_MULTIPLIED_BIT_KHR;
        }
        else if (surface_properties.supportedCompositeAlpha & VK_COMPOSITE_ALPHA_INHERIT_BIT_KHR)
        {
            swapchainInfo.compositeAlpha = VK_COMPOSITE_ALPHA_INHERIT_BIT_KHR;
        }
        swapchainInfo.presentMode = VK_PRESENT_MODE_FIFO_KHR;
        swapchainInfo.clipped = true;
        VkSwapchainKHR swapchain;
        if (vkCreateSwapchainKHR(_device, &swapchainInfo, nullptr, &swapchain))
        {
            return true;
        }

        uint32_t imageCount;
        vkGetSwapchainImagesKHR(_device, swapchain, &imageCount, nullptr);

        std::vector<VkImage> images(imageCount);
        vkGetSwapchainImagesKHR(_device, swapchain, &imageCount, images.data());

        for (VkImage &image : images)
        {
            // Create an image view which we can render into.
            VkImageViewCreateInfo view_info{VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO};
            view_info.viewType = VK_IMAGE_VIEW_TYPE_2D;
            view_info.format = surface_format.format;
            view_info.image = image;
            view_info.subresourceRange.levelCount = 1;
            view_info.subresourceRange.layerCount = 1;
            view_info.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            view_info.components.r = VK_COMPONENT_SWIZZLE_R;
            view_info.components.g = VK_COMPONENT_SWIZZLE_G;
            view_info.components.b = VK_COMPONENT_SWIZZLE_B;
            view_info.components.a = VK_COMPONENT_SWIZZLE_A;

            VkImageView view;
            vkCreateImageView(_device, &view_info, nullptr, &view);

            _imageViews.push_back(view);
        }

        _imageFormat = surface_format.format;
        _imageExtent = surface_properties.currentExtent;
        _swapchain = swapchain;

        return true;
    }

    void SwapchainImpl::acquire(VkSemaphore semaphore)
    {
        vkAcquireNextImageKHR(_device, _swapchain, 1000000000, semaphore, nullptr, &_imageIndex);
    }

    SwapchainImpl::~SwapchainImpl()
    {
        for (VkImageView &view : _imageViews)
        {
            vkDestroyImageView(_device, view, nullptr);
        }

        vkDestroySwapchainKHR(_device, _swapchain, nullptr);
    }

    Swapchain::Swapchain(SwapchainImpl *impl) : _impl(impl), color(std::make_shared<Texture>(
                                                                 nullptr,
                                                                 [impl]()
                                                                 {
                                                                     Format format = Format::UNDEFINED;
                                                                     switch (impl->imageFormat())
                                                                     {
                                                                     case VK_FORMAT_R8G8B8A8_UNORM:
                                                                         format = Format::RGBA8_UNORM;
                                                                         break;
                                                                     case VK_FORMAT_B8G8R8A8_UNORM:
                                                                         format = Format::BGRA8_UNORM;
                                                                         break;
                                                                     default:
                                                                         throw "unsupported swapchain image format";
                                                                         break;
                                                                     }
                                                                     auto info = std::make_shared<TextureInfo>();
                                                                     info->format = format;
                                                                     info->width = impl->imageExtent().width;
                                                                     info->height = impl->imageExtent().height;
                                                                     return info;
                                                                 }(),
                                                                 true))
    {
    }

    void Swapchain::acquire(const std::shared_ptr<Semaphore> &semaphore)
    {
        _impl->acquire(*semaphore->impl);
    }

    Swapchain::~Swapchain() {}
}