#include "gfx/Semaphore.hpp"
#include "Semaphore_impl.hpp"

namespace gfx
{
    Semaphore_impl::Semaphore_impl(Device_impl *device) : _device(device) {}
    Semaphore_impl::~Semaphore_impl() {}

    Semaphore::Semaphore(Device_impl *device) : impl(std::make_unique<Semaphore_impl>(device)) {}

    bool Semaphore::initialize()
    {
        VkSemaphoreCreateInfo semaphoreCreateInfo = {};
        semaphoreCreateInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;
        auto res = vkCreateSemaphore(*impl->_device, &semaphoreCreateInfo, nullptr, &impl->_semaphore);
        if (res)
        {
            return true;
        }
        return false;
    }

    Semaphore::~Semaphore()
    {
        vkDestroySemaphore(*impl->_device, impl->_semaphore, nullptr);
    }
}
