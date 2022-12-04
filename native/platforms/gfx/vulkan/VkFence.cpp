#include "bindings/gfx/Fence.hpp"
#include "VkFence_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        Fence_impl::Fence_impl(Device_impl *device) : _device(device) {}
        Fence_impl::~Fence_impl() {}

        Fence::Fence(std::unique_ptr<Fence_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

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
}
