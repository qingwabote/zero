#pragma once

#include "DeviceImpl.hpp"
#include "gfx/info.hpp"
#include <bastard/EventEmitter.hpp>

namespace gfx
{
    enum class BufferImplEvent
    {
        RESET
    };

    class BufferImpl : public bastard::EventEmitter<BufferImplEvent>
    {
    private:
        DeviceImpl *_device = nullptr;

        VkBuffer _buffer = nullptr;
        VmaAllocation _allocation = nullptr;
        VmaAllocationInfo _allocationInfo{};

    public:
        const std::shared_ptr<BufferInfo> info;

        BufferImpl(DeviceImpl *device, const std::shared_ptr<BufferInfo> &info);

        bool initialize();

        void upload(const void *src, size_t src_size, size_t dst_offset);

        void resize(uint32_t size);

        operator VkBuffer() { return _buffer; }

        ~BufferImpl();
    };

}
