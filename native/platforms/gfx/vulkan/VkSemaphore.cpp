#include "bindings/gfx/Semaphore.hpp"
#include "VkSemaphore_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        Semaphore_impl::Semaphore_impl(Device_impl *device) : _device(device) {}
        Semaphore_impl::~Semaphore_impl() {}

        Semaphore::Semaphore(std::unique_ptr<Semaphore_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        bool Semaphore::initialize()
        {
            VkSemaphoreCreateInfo semaphoreCreateInfo = {};
            semaphoreCreateInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;
            auto res = vkCreateSemaphore(_impl->_device->device(), &semaphoreCreateInfo, nullptr, &_impl->_semaphore);
            if (res)
            {
                return true;
            }
            return false;
        }

        Semaphore::~Semaphore()
        {
            vkDestroySemaphore(_impl->_device->device(), _impl->_semaphore, nullptr);
        }
    }
}
