#pragma once

#include <phys/type.hpp>
#include "../../../portation.h"

extern "C"
{
    PK_EXPORT phys::Quat *physQuat_new();

    PK_EXPORT float physQuat_getX(phys::Quat *q);
    PK_EXPORT float physQuat_getY(phys::Quat *q);
    PK_EXPORT float physQuat_getZ(phys::Quat *q);
    PK_EXPORT float physQuat_getW(phys::Quat *q);

    PK_EXPORT float *physQuat_get(phys::Quat *q);
    PK_EXPORT void physQuat_set(phys::Quat *v4, float x, float y, float z, float w);
}