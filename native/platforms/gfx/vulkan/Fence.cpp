#include "gfx/Fence.hpp"
#include "Fence_impl.hpp"

namespace gfx
{
    Fence_impl::Fence_impl(Device_impl *device) : _device(device) {}
    Fence_impl::~Fence_impl() {}

    Fence::Fence(Device_impl *device) : impl(std::make_unique<Fence_impl>(device)) {}

    bool Fence::initialize(bool signaled)
    {
        VkFenceCreateInfo fenceCreateInfo = {};
        fenceCreateInfo.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
        if (signaled)
        {
            fenceCreateInfo.flags = VK_FENCE_CREATE_SIGNALED_BIT;
        }
        auto res = vkCreateFence(*impl->_device, &fenceCreateInfo, nullptr, &impl->_fence);
        if (res)
        {
            return true;
        }
        return false;
    }

    Fence::~Fence()
    {
        vkDestroyFence(*impl->_device, impl->_fence, nullptr);
    }
}
