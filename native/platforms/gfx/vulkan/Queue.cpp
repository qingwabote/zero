#include "gfx/Queue.hpp"
#include "Queue_impl.hpp"

#include "gfx/Fence.hpp"
#include "Fence_impl.hpp"

#include "gfx/Semaphore.hpp"
#include "Semaphore_impl.hpp"

#include "gfx/CommandBuffer.hpp"
#include "CommandBuffer_impl.hpp"

namespace gfx
{
    Queue_impl::Queue_impl(Device_impl *device) : _device(device) {}
    Queue_impl::~Queue_impl() {}

    Queue::Queue(Device_impl *device) : _impl(std::make_unique<Queue_impl>(device)) {}

    void Queue::submit(const std::shared_ptr<SubmitInfo> &info, const std::shared_ptr<Fence> &fence)
    {
        VkSubmitInfo submitInfo = {VK_STRUCTURE_TYPE_SUBMIT_INFO};

        if (info->waitSemaphore)
        {
            static VkSemaphore waitSemaphore = *info->waitSemaphore->impl;
            submitInfo.pWaitSemaphores = &waitSemaphore;
            submitInfo.waitSemaphoreCount = 1;
        }

        if (info->waitDstStageMask)
        {
            static VkPipelineStageFlags waitDstStageMask = info->waitDstStageMask;
            submitInfo.pWaitDstStageMask = &waitDstStageMask;
        }

        if (info->signalSemaphore)
        {
            static VkSemaphore signalSemaphore = *info->signalSemaphore->impl;
            submitInfo.pSignalSemaphores = &signalSemaphore;
            submitInfo.signalSemaphoreCount = 1;
        }

        VkCommandBuffer commandBuffer = *info->commandBuffer->impl;
        submitInfo.pCommandBuffers = &commandBuffer;
        submitInfo.commandBufferCount = 1;
        vkQueueSubmit(*_impl, 1, &submitInfo, *fence->impl);
    }

    void Queue::present(const std::shared_ptr<Semaphore> &c_waitSemaphore)
    {
        VkPresentInfoKHR presentInfo = {VK_STRUCTURE_TYPE_PRESENT_INFO_KHR};
        auto swapchain = _impl->_device->swapchain();
        presentInfo.pSwapchains = &swapchain;
        presentInfo.swapchainCount = 1;
        VkSemaphore waitSemaphore = *c_waitSemaphore->impl;
        presentInfo.pWaitSemaphores = &waitSemaphore;
        presentInfo.waitSemaphoreCount = 1;
        auto swapchainImageIndex = _impl->_device->swapchainImageIndex();
        presentInfo.pImageIndices = &swapchainImageIndex;
        vkQueuePresentKHR(*_impl, &presentInfo);
    }

    Queue::~Queue() {}
}
