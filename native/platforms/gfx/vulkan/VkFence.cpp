#include "bindings/gfx/Fence.hpp"
#include "VkFence_impl.hpp"

namespace binding::gfx
{
    Fence_impl::Fence_impl(Device_impl *device) : _device(device) {}
    Fence_impl::~Fence_impl() {}

    Fence::Fence(Device_impl *device) : _impl(std::make_unique<Fence_impl>(device)) {}

    bool Fence::initialize(bool signaled)
    {
        VkFenceCreateInfo fenceCreateInfo = {};
        fenceCreateInfo.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
        if (signaled)
        {
            fenceCreateInfo.flags = VK_FENCE_CREATE_SIGNALED_BIT;
        }
        auto res = vkCreateFence(*_impl->_device, &fenceCreateInfo, nullptr, &_impl->_fence);
        if (res)
        {
            return true;
        }
        return false;
    }

    Fence::~Fence()
    {
        vkDestroyFence(*_impl->_device, _impl->_fence, nullptr);
    }
}
