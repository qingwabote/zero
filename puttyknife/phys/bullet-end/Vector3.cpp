#include <phys/Vector3.hpp>
#include <LinearMath/btVector3.h>

phys::Vector3 *physVector3_new()
{
    return new btVector3();
}

float physVector3_getX(phys::Vector3 *v3)
{
    return v3->getX();
}

float physVector3_getY(phys::Vector3 *v3)
{
    return v3->getY();
}

float physVector3_getZ(phys::Vector3 *v3)
{
    return v3->getZ();
}

void physVector3_set(phys::Vector3 *v3, float x, float y, float z)
{
    v3->setValue(x, y, z);
}