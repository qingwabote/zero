#pragma once

#include "VkDevice_impl.hpp"
#include "gfx/info.hpp"
#include "base/event/Emitter.hpp"

namespace gfx
{
    enum class BufferEvent_impl
    {
        RESET
    };

    class Buffer_impl : public event::Emitter<BufferEvent_impl>
    {
    private:
        Device_impl *_device = nullptr;

        VkBuffer _buffer = nullptr;
        VmaAllocation _allocation = nullptr;
        VmaAllocationInfo _allocationInfo{};

    public:
        const std::shared_ptr<BufferInfo> info;

        Buffer_impl(Device_impl *device, const std::shared_ptr<BufferInfo> &info);

        bool initialize();

        void update(const void *data, size_t offset, size_t length);

        void resize(uint32_t size);

        operator VkBuffer() { return _buffer; }

        ~Buffer_impl();
    };

}
