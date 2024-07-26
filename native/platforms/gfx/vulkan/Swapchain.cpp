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
                                               colorTexture(std::make_shared<Texture>(device, std::make_shared<TextureInfo>(), true)),
                                               width(device->swapchainImageExtent().width),
                                               height(device->swapchainImageExtent().height) {}

    void Swapchain::acquire(const std::shared_ptr<Semaphore> &semaphore)
    {
        _impl->acquire(*semaphore->impl);
    }

    Swapchain::~Swapchain() {}
}