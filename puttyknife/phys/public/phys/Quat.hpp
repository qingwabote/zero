#pragma once

#include <phys/type.hpp>

extern "C"
{
    phys::Quat *physQuat_new();

    float physQuat_getX(phys::Quat *q);
    float physQuat_getY(phys::Quat *q);
    float physQuat_getZ(phys::Quat *q);
    float physQuat_getW(phys::Quat *q);

    void physQuat_set(phys::Quat *v4, float x, float y, float z, float w);
}