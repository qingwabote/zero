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

    void Queue::submit(const SubmitInfo &info, Fence *c_fence)
    {
        VkSubmitInfo submitInfo = {VK_STRUCTURE_TYPE_SUBMIT_INFO};

        if (info.waitSemaphore)
        {
            static std::vector<VkSemaphore> waitSemaphores(1);
            waitSemaphores[0] = info.waitSemaphore->impl();
            submitInfo.pWaitSemaphores = waitSemaphores.data();
            submitInfo.waitSemaphoreCount = waitSemaphores.size();
        }

        if (info.waitDstStageMask)
        {
            static std::vector<VkPipelineStageFlags> waitDstStageMask(1);
            waitDstStageMask[0] = info.waitDstStageMask;
            submitInfo.pWaitDstStageMask = waitDstStageMask.data();
        }

        if (info.signalSemaphore)
        {
            static std::vector<VkSemaphore> signalSemaphores(1);
            signalSemaphores[0] = info.signalSemaphore->impl();
            submitInfo.pSignalSemaphores = signalSemaphores.data();
            submitInfo.signalSemaphoreCount = signalSemaphores.size();
        }

        static std::vector<VkCommandBuffer> commandBuffers(1);
        commandBuffers[0] = info.commandBuffer->impl();
        submitInfo.pCommandBuffers = commandBuffers.data();
        submitInfo.commandBufferCount = commandBuffers.size();
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
