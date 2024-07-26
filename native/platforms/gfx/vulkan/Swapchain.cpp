#include "gfx/Swapchain.hpp"
#include "gfx/Texture.hpp"
#include "Swapchain_impl.hpp"
#include "Semaphore_impl.hpp"

namespace gfx
{
    Swapchain_impl::Swapchain_impl(Device_impl *device) : _device(device) {}

    void Swapchain_impl::acquire(VkSemaphore semaphore)
    {
        _device->acquireNextImage(semaphore);
    }

    Swapchain_impl::~Swapchain_impl() {}

    Swapchain::Swapchain(Device_impl *device) : _impl(std::make_unique<Swapchain_impl>(device)),
                                                colorTexture(std::make_shared<Texture>(device, std::make_shared<TextureInfo>(), true)),
                                                width(device->swapchainImageExtent().width),
                                                height(device->swapchainImageExtent().height) {}

    void Swapchain::acquire(const std::shared_ptr<Semaphore> &semaphore)
    {
        _impl->acquire(*semaphore->impl);
    }

    Swapchain::~Swapchain() {}
}