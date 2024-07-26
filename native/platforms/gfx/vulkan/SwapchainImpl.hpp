#include "DeviceImpl.hpp"

namespace gfx
{
    class SwapchainImpl
    {
    private:
        DeviceImpl *_device{nullptr};

    public:
        SwapchainImpl(DeviceImpl *device);
        void acquire(VkSemaphore semaphore);
        ~SwapchainImpl();
    };
}