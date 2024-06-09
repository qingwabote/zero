#pragma once

#include "VkDevice_impl.hpp"
#include "gfx/info.hpp"

namespace gfx
{
    class Texture_impl
    {
    private:
        Device_impl *_device{nullptr};

        VkImage _image{nullptr};
        VmaAllocation _allocation{nullptr};
        VmaAllocationInfo _allocationInfo{};

        VkImageView _imageView{nullptr};

        bool _swapchain{false};

    public:
        bool swapchain() { return _swapchain; }

        const std::shared_ptr<TextureInfo> info;

        Texture_impl(Device_impl *device, const std::shared_ptr<TextureInfo> &info, bool swapchain = false);

        bool initialize();

        operator VkImage() { return _image; }
        operator VkImageView() { return _imageView; }

        ~Texture_impl();
    };

}
