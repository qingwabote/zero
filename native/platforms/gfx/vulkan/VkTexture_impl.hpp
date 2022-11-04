#pragma once

#include "VkDevice_impl.hpp"

namespace binding
{
    namespace gfx
    {
        class Texture_impl
        {
            friend class Texture;

        private:
            Device_impl *_device = nullptr;

            VkImage _image = nullptr;
            VmaAllocation _allocation = nullptr;
            VmaAllocationInfo _allocationInfo;

            VkImageView _imageView = nullptr;

        public:
            VkImageView imageView() { return _imageView; }

            Texture_impl(Device_impl *device);

            operator VkImage() { return _image; }
            operator VkImageView() { return _imageView; }

            ~Texture_impl();
        };

    }
}
