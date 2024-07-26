#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Buffer_impl;

    class Buffer
    {
    public:
        const std::shared_ptr<Buffer_impl> impl;

        const std::shared_ptr<BufferInfo> &info;

        Buffer(Device_impl *device, const std::shared_ptr<BufferInfo> &info);

        bool initialize();
        void update(const std::shared_ptr<const void> &data, size_t offset, size_t length);
        void resize(uint32_t size);

        ~Buffer();
    };
}
