#pragma once

#include "DeviceImpl.hpp"
#include "gfx/info.hpp"
#include "base/event/Emitter.hpp"

namespace gfx
{
    enum class TextureImplEvent
    {
        RESET
    };

    class TextureImpl : public event::Emitter<TextureImplEvent>
    {
    private:
        DeviceImpl *_device{nullptr};

        VkImage _image{nullptr};
        VmaAllocation _allocation{nullptr};
        VmaAllocationInfo _allocationInfo{};

        VkImageView _imageView{nullptr};

        bool _swapchain{false};

    public:
        bool swapchain() { return _swapchain; }

        const std::shared_ptr<TextureInfo> info;

        TextureImpl(DeviceImpl *device, const std::shared_ptr<TextureInfo> &info, bool swapchain = false);

        bool initialize();

        void update(const void *data, uint32_t width, uint32_t height);

        void resize(uint32_t width, uint32_t height);

        void clear();

        operator VkImage() { return _image; }
        operator VkImageView() { return _imageView; }

        ~TextureImpl();
    };

}
