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
            format = VK_FORMAT_R8G8B8A8_UNORM; // just use linear format and then do gamma correction in shader
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
        allocationCreateInfo.usage = VMA_MEMORY_USAGE_AUTO_PREFER_DEVICE;
        if (vmaCreateImage(_device->allocator(), &imageInfo, &allocationCreateInfo, &_image, &_allocation, &_allocationInfo))
        {
            return true;
        }

        if ((info->usage & TextureUsageFlagBits::HOST_TRANSFER) != TextureUsageFlagBits::NONE)
        {
            VkImageSubresourceRange subresource_range = {};
            subresource_range.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            subresource_range.levelCount = 1;
            subresource_range.layerCount = 1;

            VkHostImageLayoutTransitionInfoEXT host_image_layout_transition_info = {VK_STRUCTURE_TYPE_HOST_IMAGE_LAYOUT_TRANSITION_INFO_EXT};
            host_image_layout_transition_info.image = _image;
            host_image_layout_transition_info.oldLayout = VK_IMAGE_LAYOUT_UNDEFINED;
            host_image_layout_transition_info.newLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
            host_image_layout_transition_info.subresourceRange = subresource_range;

            vkTransitionImageLayoutEXT(*_device, 1, &host_image_layout_transition_info);
        }

        VkImageViewCreateInfo imageViewInfo = {VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO};
        imageViewInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
        imageViewInfo.image = _image;
        imageViewInfo.format = format;
        imageViewInfo.subresourceRange.levelCount = 1;
        imageViewInfo.subresourceRange.layerCount = 1;
        imageViewInfo.subresourceRange.aspectMask = aspectMask;
        if (vkCreateImageView(*_device, &imageViewInfo, nullptr, &_imageView))
        {
            return true;
        }

        return false;
    }

    void TextureImpl::update(const void *data, uint32_t width, uint32_t height)
    {
        VkMemoryToImageCopyEXT region = {VK_STRUCTURE_TYPE_MEMORY_TO_IMAGE_COPY_EXT};
        region.pHostPointer = data;
        region.imageSubresource.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
        region.imageSubresource.layerCount = 1;
        region.imageExtent.width = width;
        region.imageExtent.height = height;
        region.imageExtent.depth = 1;

        VkCopyMemoryToImageInfoEXT info = {VK_STRUCTURE_TYPE_COPY_MEMORY_TO_IMAGE_INFO_EXT};
        info.dstImage = _image;
        info.dstImageLayout = VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL;
        info.regionCount = 1;
        info.pRegions = &region;
        vkCopyMemoryToImageEXT(*_device, &info);
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

    void Texture::update(const std::shared_ptr<ImageBitmap> &imageBitmap)
    {
        impl->update(imageBitmap->pixels(), imageBitmap->width(), imageBitmap->height());
    }

    Texture::~Texture() {}
}
