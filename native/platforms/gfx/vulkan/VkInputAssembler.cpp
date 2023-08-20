#include "gfx/InputAssembler.hpp"

namespace gfx
{
    InputAssembler::InputAssembler(Device_impl *device) {}

    bool InputAssembler::initialize(const std::shared_ptr<InputAssemblerInfo> &info)
    {
        _info = info;
        return false;
    }

    InputAssembler::~InputAssembler() {}
}
