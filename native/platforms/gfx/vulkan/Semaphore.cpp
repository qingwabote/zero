#include "gfx/Semaphore.hpp"
#include "SemaphoreImpl.hpp"

namespace gfx
{
    SemaphoreImpl::SemaphoreImpl(DeviceImpl *device) : _device(device) {}
    SemaphoreImpl::~SemaphoreImpl() {}

    Semaphore::Semaphore(DeviceImpl *device) : impl(std::make_unique<SemaphoreImpl>(device)) {}

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
