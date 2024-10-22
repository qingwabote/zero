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
        void update(const std::shared_ptr<const Span> &span, size_t offset, size_t length);
        void resize(uint32_t size);

        ~Buffer();
    };
}
