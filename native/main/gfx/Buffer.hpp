#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;
    class Buffer_impl;

    class Buffer
    {
    private:
        std::shared_ptr<Buffer_impl> _impl;

    public:
        const std::shared_ptr<Buffer_impl> &impl() { return _impl; }
        const std::shared_ptr<const BufferInfo> &info();

        Buffer(Device_impl *device);

        bool initialize(const BufferInfo &info);
        void update(const std::shared_ptr<const void> &data, size_t offset, size_t length);
        void resize(uint32_t size);

        ~Buffer();
    };
}
