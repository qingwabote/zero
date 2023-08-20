#pragma once

#include "info.hpp"

namespace gfx
{
    class Device_impl;

    class InputAssembler
    {
    private:
        std::shared_ptr<InputAssemblerInfo> _info;

    public:
        const std::shared_ptr<InputAssemblerInfo> &info() { return _info; };

        InputAssembler(Device_impl *device);

        bool initialize(const std::shared_ptr<InputAssemblerInfo> &info);

        ~InputAssembler();
    };
}
