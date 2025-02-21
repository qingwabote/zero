#pragma once

#include <phys/type.hpp>

extern "C"
{
    phys::Vector3 *physVector3_new();

    float physVector3_getX(phys::Vector3 *v3);
    float physVector3_getY(phys::Vector3 *v3);
    float physVector3_getZ(phys::Vector3 *v3);

    void physVector3_set(phys::Vector3 *v3, float x, float y, float z);
}