#include "gfx/Swapchain.hpp"
#include "gfx/Texture.hpp"
#include "VkSwapchain_impl.hpp"
#include "VkSemaphore_impl.hpp"

namespace gfx
{
    Swapchain_impl::Swapchain_impl(Device_impl *device) : _device(device) {}

    void Swapchain_impl::acquire(VkSemaphore semaphore)
    {
        _device->acquireNextImage(semaphore);
    }

    Swapchain_impl::~Swapchain_impl() {}

    Swapchain::Swapchain(Device_impl *device)
    {
        auto colorTexture_info = std::make_shared<TextureInfo>();
        colorTexture_info->samples = SampleCountFlagBits::X1;
        auto colorTexture = std::make_shared<Texture>(device, true);
        colorTexture->initialize(colorTexture_info);
        _colorTexture = std::move(colorTexture);

        _width = device->swapchainImageExtent().width;
        _height = device->swapchainImageExtent().height;

        _impl = std::make_unique<Swapchain_impl>(device);
    }

    void Swapchain::acquire(const std::shared_ptr<Semaphore> &semaphore)
    {
        _impl->acquire(semaphore->impl());
    }

    Swapchain::~Swapchain() {}
}