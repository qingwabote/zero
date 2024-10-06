#include "gfx/Swapchain.hpp"
#include "gfx/Texture.hpp"
#include "SwapchainImpl.hpp"
#include "SemaphoreImpl.hpp"

namespace gfx
{
    SwapchainImpl::SwapchainImpl(DeviceImpl *device) : _device(device) {}

    void SwapchainImpl::acquire(VkSemaphore semaphore)
    {
        _device->acquireNextImage(semaphore);
    }

    SwapchainImpl::~SwapchainImpl() {}

    Swapchain::Swapchain(DeviceImpl *device) : _impl(std::make_unique<SwapchainImpl>(device)),
                                               color(std::make_shared<Texture>(
                                                   device,
                                                   [device]()
                                                   {
                                                       Format format = Format::UNDEFINED;
                                                       switch (device->swapchainImageFormat())
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
                                                       info->width = device->swapchainImageExtent().width;
                                                       info->height = device->swapchainImageExtent().height;
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