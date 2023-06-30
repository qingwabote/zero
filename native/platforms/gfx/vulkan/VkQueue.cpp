#include "bindings/gfx/Queue.hpp"
#include "VkQueue_impl.hpp"

#include "bindings/gfx/Fence.hpp"
#include "VkFence_impl.hpp"

#include "bindings/gfx/Semaphore.hpp"
#include "VkSemaphore_impl.hpp"

#include "bindings/gfx/CommandBuffer.hpp"
#include "VkCommandBuffer_impl.hpp"

namespace binding::gfx
{
    Queue_impl::Queue_impl(Device_impl *device) : _device(device) {}
    Queue_impl::~Queue_impl() {}

    Queue::Queue(Device_impl *device) : _impl(std::make_unique<Queue_impl>(device)) {}

    void Queue::submit(const std::shared_ptr<SubmitInfo> &info, const std::shared_ptr<Fence> &fence)
    {
        VkSubmitInfo submitInfo = {VK_STRUCTURE_TYPE_SUBMIT_INFO};

        if (info->waitSemaphore)
        {
            static std::vector<VkSemaphore> waitSemaphores(1);
            waitSemaphores[0] = info->waitSemaphore->impl();
            submitInfo.pWaitSemaphores = waitSemaphores.data();
            submitInfo.waitSemaphoreCount = waitSemaphores.size();
        }

        if (info->waitDstStageMask)
        {
            static std::vector<VkPipelineStageFlags> waitDstStageMask(1);
            waitDstStageMask[0] = info->waitDstStageMask;
            submitInfo.pWaitDstStageMask = waitDstStageMask.data();
        }

        if (info->signalSemaphore)
        {
            static std::vector<VkSemaphore> signalSemaphores(1);
            signalSemaphores[0] = info->signalSemaphore->impl();
            submitInfo.pSignalSemaphores = signalSemaphores.data();
            submitInfo.signalSemaphoreCount = signalSemaphores.size();
        }

        static std::vector<VkCommandBuffer> commandBuffers(1);
        commandBuffers[0] = info->commandBuffer->impl();
        submitInfo.pCommandBuffers = commandBuffers.data();
        submitInfo.commandBufferCount = commandBuffers.size();
        vkQueueSubmit(*_impl, 1, &submitInfo, fence->impl());
    }

    void Queue::present(const std::shared_ptr<Semaphore> &c_waitSemaphore)
    {
        VkPresentInfoKHR presentInfo = {VK_STRUCTURE_TYPE_PRESENT_INFO_KHR};
        auto swapchain = _impl->_device->swapchain();
        presentInfo.pSwapchains = &swapchain;
        presentInfo.swapchainCount = 1;
        VkSemaphore waitSemaphore = c_waitSemaphore->impl();
        presentInfo.pWaitSemaphores = &waitSemaphore;
        presentInfo.waitSemaphoreCount = 1;
        auto swapchainImageIndex = _impl->_device->swapchainImageIndex();
        presentInfo.pImageIndices = &swapchainImageIndex;
        vkQueuePresentKHR(*_impl, &presentInfo);
    }

    void Queue::waitFence(const std::shared_ptr<Fence> &c_fence)
    {
        VkFence fence = c_fence->impl();
        vkWaitForFences(*_impl->_device, 1, &fence, true, 1000000000);
        vkResetFences(*_impl->_device, 1, &fence);
    }

    Queue::~Queue() {}
}
