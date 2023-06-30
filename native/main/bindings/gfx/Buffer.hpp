#pragma once

#include "info.hpp"

namespace binding::gfx
{
    class Device_impl;
    class Buffer_impl;

    class Buffer
    {
    private:
        std::unique_ptr<Buffer_impl> _impl;
        std::shared_ptr<BufferInfo> _info;

    public:
        Buffer_impl &impl() { return *_impl.get(); }
        const std::shared_ptr<BufferInfo> &info() { return _info; };

        Buffer(Device_impl *device);

        bool initialize(const std::shared_ptr<BufferInfo> &info);
        void update(const std::shared_ptr<const void> &data, size_t offset, size_t length);

        ~Buffer();
    };
}
