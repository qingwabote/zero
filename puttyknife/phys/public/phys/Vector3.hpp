#pragma once

#include <phys/type.hpp>
#include "../../../portation.h"

extern "C"
{
    PK_EXPORT phys::Vector3 *physVector3_new();

    PK_EXPORT float physVector3_getX(phys::Vector3 *v3);
    PK_EXPORT float physVector3_getY(phys::Vector3 *v3);
    PK_EXPORT float physVector3_getZ(phys::Vector3 *v3);

    PK_EXPORT void physVector3_set(phys::Vector3 *v3, float x, float y, float z);
}