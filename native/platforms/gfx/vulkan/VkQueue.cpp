#include "bindings/gfx/Queue.hpp"
#include "VkQueue_impl.hpp"
#include "VkFence_impl.hpp"
#include "VkSemaphore_impl.hpp"
#include "VkCommandBuffer_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding::gfx
{
    Queue_impl::Queue_impl(Device_impl *device) : _device(device) {}
    Queue_impl::~Queue_impl() {}

    Queue::Queue(std::unique_ptr<Queue_impl> impl)
        : Binding(), _impl(std::move(impl)) {}

    void Queue::submit(SubmitInfo &info, Fence *c_fence)
    {
        VkSubmitInfo submitInfo = {VK_STRUCTURE_TYPE_SUBMIT_INFO};

        if (info.waitSemaphore)
        {
            VkSemaphore waitSemaphore = info.waitSemaphore->impl();
            submitInfo.pWaitSemaphores = &waitSemaphore;
            submitInfo.waitSemaphoreCount = 1;
        }

        if (info.waitDstStageMask)
        {
            VkPipelineStageFlags waitStage = info.waitDstStageMask;
            submitInfo.pWaitDstStageMask = &waitStage;
        }

        if (info.signalSemaphore)
        {
            VkSemaphore signalSemaphore = info.signalSemaphore->impl();
            submitInfo.pSignalSemaphores = &signalSemaphore;
            submitInfo.signalSemaphoreCount = 1;
        }

        VkCommandBuffer commandBuffer = info.commandBuffer->impl();
        submitInfo.pCommandBuffers = &commandBuffer;
        submitInfo.commandBufferCount = 1;
        vkQueueSubmit(*_impl, 1, &submitInfo, c_fence->impl());
    }

    void Queue::present(Semaphore *c_waitSemaphore)
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

    void Queue::waitFence(Fence *c_fence)
    {
        VkFence fence = c_fence->impl();
        vkWaitForFences(*_impl->_device, 1, &fence, true, 1000000000);
        vkResetFences(*_impl->_device, 1, &fence);
    }

    Queue::~Queue() {}
}
