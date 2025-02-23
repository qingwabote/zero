#pragma once

#include <cstdint>

namespace gfx
{
    class Capabilities
    {
    public:
        const size_t uniformBufferOffsetAlignment;
        const int clipSpaceMinZ;

        Capabilities(size_t uniformBufferOffsetAlignment, int clipSpaceMinZ)
            : uniformBufferOffsetAlignment(uniformBufferOffsetAlignment),
              clipSpaceMinZ(clipSpaceMinZ) {}
    };
}
