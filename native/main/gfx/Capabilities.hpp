#pragma once

#include <cstdint>

namespace gfx
{
    class Capabilities
    {
    private:
        uint32_t _uniformBufferOffsetAlignment;
        int _clipSpaceMinZ;

    public:
        uint32_t uniformBufferOffsetAlignment() { return _uniformBufferOffsetAlignment; };
        int clipSpaceMinZ() { return _clipSpaceMinZ; };

        Capabilities(uint32_t uniformBufferOffsetAlignment, int clipSpaceMinZ)
            : _uniformBufferOffsetAlignment(uniformBufferOffsetAlignment),
              _clipSpaceMinZ(clipSpaceMinZ) {}
    };
}
