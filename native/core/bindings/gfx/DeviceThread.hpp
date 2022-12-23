#pragma once

#include "base/threading/ThreadPool.hpp"

namespace binding::gfx
{
    class DeviceThread
    {
    public:
        static ThreadPool &instance();
    };
}
