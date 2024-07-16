#include "gfx/Semaphore.hpp"
#include "Semaphore_impl.hpp"

namespace gfx
{
    Semaphore_impl::Semaphore_impl(Device_impl *device) : _device(device) {}
    Semaphore_impl::~Semaphore_impl() {}

    Semaphore::Semaphore(Device_impl *device) : _impl(std::make_unique<Semaphore_impl>(device)) {}

    bool Semaphore::initialize()
    {
        VkSemaphoreCreateInfo semaphoreCreateInfo = {};
        semaphoreCreateInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;
        auto res = vkCreateSemaphore(*_impl->_device, &semaphoreCreateInfo, nullptr, &_impl->_semaphore);
        if (res)
        {
            return true;
        }
        return false;
    }

    Semaphore::~Semaphore()
    {
        vkDestroySemaphore(*_impl->_device, _impl->_semaphore, nullptr);
    }
}
