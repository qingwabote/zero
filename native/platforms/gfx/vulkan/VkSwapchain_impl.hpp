#include "VkDevice_impl.hpp"

namespace gfx
{
    class Swapchain_impl
    {
    private:
        Device_impl *_device{nullptr};

    public:
        Swapchain_impl(Device_impl *device);
        void acquire(VkSemaphore semaphore);
        ~Swapchain_impl();
    };
}