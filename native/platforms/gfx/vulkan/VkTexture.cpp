#include "bindings/gfx/Texture.hpp"
#include "VkTexture_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        Texture_impl::Texture_impl(Device_impl *device, bool swapchain) : _device(device), _swapchain(swapchain) {}

        bool Texture_impl::initialize(const TextureInfo &info)
        {
            if (_swapchain)
            {
                return false;
            }

            VkImageUsageFlagBits usage = static_cast<VkImageUsageFlagBits>(info.usage);

            auto format = VK_FORMAT_R8G8B8A8_UNORM;
            auto aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            if (usage & VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT)
            {
                format = _device->swapchainImageFormat();
            }
            else if (usage & VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT)
            {
                format = VK_FORMAT_D32_SFLOAT;
                aspectMask = VK_IMAGE_ASPECT_DEPTH_BIT;
            }

            VkExtent3D extent{};
            extent.width = info.width;
            extent.height = info.height;
            extent.depth = 1;
            VkImageCreateInfo imageInfo = {};
            imageInfo.sType = VK_STRUCTURE_TYPE_IMAGE_CREATE_INFO;
            imageInfo.imageType = VK_IMAGE_TYPE_2D;
            imageInfo.extent = extent;
            imageInfo.mipLevels = 1;
            imageInfo.arrayLayers = 1;
            imageInfo.samples = static_cast<VkSampleCountFlagBits>(info.samples);
            imageInfo.tiling = VK_IMAGE_TILING_OPTIMAL;
            imageInfo.usage = usage;
            imageInfo.format = format;
            VmaAllocationCreateInfo allocationCreateInfo = {};
            allocationCreateInfo.usage = VMA_MEMORY_USAGE_GPU_ONLY;
            auto err = vmaCreateImage(_device->allocator(), &imageInfo, &allocationCreateInfo, &_image, &_allocation, &_allocationInfo);
            if (err)
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
            err = vkCreateImageView(*_device, &imageViewInfo, nullptr, &_imageView);
            if (err)
            {
                return true;
            }

            return false;
        }

        Texture_impl::~Texture_impl()
        {
            if (!_swapchain)
            {
                vkDestroyImageView(*_device, _imageView, nullptr);
                vmaDestroyImage(_device->allocator(), _image, _allocation);
            }
        }

        Texture::Texture(Device_impl *device, bool swapchain) : _impl(std::make_unique<Texture_impl>(device, swapchain)) {}

        bool Texture::initialize(const std::shared_ptr<TextureInfo> &info)
        {
            _info = info;
            return _impl->initialize(*info);
        }

        Texture::~Texture() {}
    }
}
