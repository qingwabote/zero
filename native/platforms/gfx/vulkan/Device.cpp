#include "gfx/Device.hpp"
#include "Log.hpp"
#include "volk.h"

Device *Device::instance()
{
    static Device instance;
    return &instance;
}

Device::Device()
{
}

Device::~Device()
{
}

bool Device::initialize()
{
    if (volkInitialize())
    {
        Log::log("Failed to initialize volk");
        return false;
    }

    return true;
}