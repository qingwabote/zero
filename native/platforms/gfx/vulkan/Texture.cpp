#include "gfx/Texture.hpp"
#include "TextureImpl.hpp"

namespace gfx
{
    TextureImpl::TextureImpl(DeviceImpl *device, const std::shared_ptr<TextureInfo> &info, bool swapchain) : _device(device), info(info), _swapchain(swapchain) {}

    bool TextureImpl::initialize()
    {
        if (_swapchain)
        {
            return false;
        }

        auto format = VK_FORMAT_UNDEFINED;
        auto aspectMask = VK_IMAGE_ASPECT_NONE;
        if ((info->usage & TextureUsageFlagBits::COLOR) != TextureUsageFlagBits::NONE)
        {
            format = _device->swapchainImageFormat();
            aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
        }
        else if ((info->usage & TextureUsageFlagBits::DEPTH_STENCIL) != TextureUsageFlagBits::NONE)
        {
            format = VK_FORMAT_D32_SFLOAT;
            aspectMask = VK_IMAGE_ASPECT_DEPTH_BIT;
        }
        else
        {
            format = VK_FORMAT_R8G8B8A8_UNORM;
            aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
        }

        VkExtent3D extent{};
        extent.width = info->width;
        extent.height = info->height;
        extent.depth = 1;
        VkImageCreateInfo imageInfo = {};
        imageInfo.sType = VK_STRUCTURE_TYPE_IMAGE_CREATE_INFO;
        imageInfo.imageType = VK_IMAGE_TYPE_2D;
        imageInfo.extent = extent;
        imageInfo.mipLevels = 1;
        imageInfo.arrayLayers = 1;
        imageInfo.samples = static_cast<VkSampleCountFlagBits>(info->samples);
        imageInfo.tiling = VK_IMAGE_TILING_OPTIMAL;
        imageInfo.usage = static_cast<VkImageUsageFlagBits>(info->usage);
        imageInfo.format = format;
        VmaAllocationCreateInfo allocationCreateInfo = {};
        allocationCreateInfo.usage = VMA_MEMORY_USAGE_GPU_ONLY;
        if (vmaCreateImage(_device->allocator(), &imageInfo, &allocationCreateInfo, &_image, &_allocation, &_allocationInfo))
        {
            return true;
        }

        VkImageViewCreateInfo imageViewInfo = {};
        imageViewInfo.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
        imageViewInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
        imageViewInfo.image = _image;
        imageViewInfo.format = format;
        imageViewInfo.subresourceRange.baseMipLevel = 0;
        imageViewInfo.subresourceRange.levelCount = 1;
        imageViewInfo.subresourceRange.baseArrayLayer = 0;
        imageViewInfo.subresourceRange.layerCount = 1;
        imageViewInfo.subresourceRange.aspectMask = aspectMask;
        if (vkCreateImageView(*_device, &imageViewInfo, nullptr, &_imageView))
        {
            return true;
        }

        return false;
    }

    TextureImpl::~TextureImpl()
    {
        if (!_swapchain)
        {
            vkDestroyImageView(*_device, _imageView, nullptr);
            vmaDestroyImage(_device->allocator(), _image, _allocation);
        }
    }

    Texture::Texture(DeviceImpl *device, const std::shared_ptr<TextureInfo> &info, bool swapchain) : impl(std::make_shared<TextureImpl>(device, info, swapchain)), info(impl->info) {}

    bool Texture::initialize()
    {
        return impl->initialize();
    }

    Texture::~Texture() {}
}
