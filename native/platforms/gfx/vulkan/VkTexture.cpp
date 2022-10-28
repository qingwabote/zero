#include "bindings/gfx/Texture.hpp"
#include "VkTexture_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        Texture_impl::Texture_impl(Device_impl *device) : _device(device) {}
        Texture_impl::~Texture_impl() {}

        Texture::Texture(std::unique_ptr<Texture_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        bool Texture::initialize(v8::Local<v8::Object> info)
        {
            auto width = sugar::v8::object_get(info, "width").As<v8::Number>()->Value();
            auto height = sugar::v8::object_get(info, "height").As<v8::Number>()->Value();

            auto format = VK_FORMAT_R8G8B8A8_SRGB;

            VkExtent3D extent{};
            extent.width = width;
            extent.height = height;
            extent.depth = 1;
            VkImageCreateInfo imageInfo = {};
            imageInfo.sType = VK_STRUCTURE_TYPE_IMAGE_CREATE_INFO;
            imageInfo.imageType = VK_IMAGE_TYPE_2D;
            imageInfo.format = format;
            imageInfo.extent = extent;
            imageInfo.mipLevels = 1;
            imageInfo.arrayLayers = 1;
            imageInfo.samples = VK_SAMPLE_COUNT_1_BIT;
            imageInfo.tiling = VK_IMAGE_TILING_OPTIMAL;
            imageInfo.usage = VK_IMAGE_USAGE_SAMPLED_BIT | VK_IMAGE_USAGE_TRANSFER_DST_BIT;
            VmaAllocationCreateInfo allocationCreateInfo = {};
            allocationCreateInfo.usage = VMA_MEMORY_USAGE_GPU_ONLY;
            auto err = vmaCreateImage(_impl->_device->allocator(), &imageInfo, &allocationCreateInfo, &_impl->_image, &_impl->_allocation, &_impl->_allocationInfo);
            if (err)
            {
                return true;
            }

            VkImageViewCreateInfo imageViewInfo = {};
            imageViewInfo.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
            imageViewInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
            imageViewInfo.image = _impl->_image;
            imageViewInfo.format = format;
            imageViewInfo.subresourceRange.baseMipLevel = 0;
            imageViewInfo.subresourceRange.levelCount = 1;
            imageViewInfo.subresourceRange.baseArrayLayer = 0;
            imageViewInfo.subresourceRange.layerCount = 1;
            imageViewInfo.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
            err = vkCreateImageView(_impl->_device->device(), &imageViewInfo, nullptr, &_impl->_imageView);
            if (err)
            {
                return true;
            }

            return false;
        }

        Texture::~Texture()
        {
            VkDevice device = _impl->_device->device();
            VkImageView imageView = _impl->_imageView;

            VmaAllocator allocator = _impl->_device->allocator();
            VkImage image = _impl->_image;
            VmaAllocation allocation = _impl->_allocation;

            vkDestroyImageView(device, imageView, nullptr);
            vmaDestroyImage(allocator, image, allocation);
        }
    }
}
