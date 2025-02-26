#pragma once

#include "DeviceImpl.hpp"
#include "gfx/info.hpp"
#include "base/event/Emitter.hpp"

namespace gfx
{
    enum class BufferImplEvent
    {
        RESET
    };

    class BufferImpl : public event::Emitter<BufferImplEvent>
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

        void update(const void *src, size_t src_size, size_t dst_offset);

        void resize(uint32_t size);

        operator VkBuffer() { return _buffer; }

        ~BufferImpl();
    };

}
