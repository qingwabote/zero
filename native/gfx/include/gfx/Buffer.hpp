#pragma once

#include "info.hpp"

namespace gfx
{
    class DeviceImpl;
    class BufferImpl;

    class Buffer
    {
    public:
        const std::shared_ptr<BufferImpl> impl;

        const std::shared_ptr<BufferInfo> &info;

        Buffer(DeviceImpl *device, const std::shared_ptr<BufferInfo> &info);

        bool initialize();
        void upload(const std::shared_ptr<const Span> &src, size_t src_offset, size_t src_length, size_t dst_offset_bytes);
        void resize(uint32_t size);

        ~Buffer();
    };
}
