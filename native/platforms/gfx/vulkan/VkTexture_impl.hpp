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

        std::shared_ptr<TextureInfo> _info;

    public:
        bool swapchain() { return _swapchain; }

        const std::shared_ptr<TextureInfo> &info() { return _info; }

        Texture_impl(Device_impl *device, bool swapchain = false);

        bool initialize(const std::shared_ptr<TextureInfo> &info);

        operator VkImage() { return _image; }
        operator VkImageView() { return _imageView; }

        ~Texture_impl();
    };

}
