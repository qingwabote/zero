#include "gfx/Fence.hpp"
#include "FenceImpl.hpp"

namespace gfx
{
    FenceImpl::FenceImpl(DeviceImpl *device) : _device(device) {}
    FenceImpl::~FenceImpl() {}

    Fence::Fence(DeviceImpl *device) : impl(std::make_unique<FenceImpl>(device)) {}

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
