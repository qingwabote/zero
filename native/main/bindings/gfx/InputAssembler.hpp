#pragma once

#include "info.hpp"

namespace binding::gfx
{
    class Device_impl;
    class InputAssembler_impl;

    class InputAssembler
    {
    private:
        std::unique_ptr<InputAssembler_impl> _impl;

        std::shared_ptr<InputAssemblerInfo> _info;

    public:
        InputAssembler_impl &impl() { return *_impl.get(); }

        const std::shared_ptr<InputAssemblerInfo> &info() { return _info; };

        InputAssembler(Device_impl *device);

        bool initialize(const std::shared_ptr<InputAssemblerInfo> &info);

        ~InputAssembler();
    };
}
