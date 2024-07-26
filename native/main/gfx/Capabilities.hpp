#pragma once

#include <cstdint>

namespace gfx
{
    class Capabilities
    {
    public:
        const uint32_t uniformBufferOffsetAlignment;
        const int clipSpaceMinZ;

        Capabilities(uint32_t uniformBufferOffsetAlignment, int clipSpaceMinZ)
            : uniformBufferOffsetAlignment(uniformBufferOffsetAlignment),
              clipSpaceMinZ(clipSpaceMinZ) {}
    };
}
