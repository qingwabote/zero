#include <phys/Quat.hpp>
#include <LinearMath/btQuaternion.h>

phys::Quat *physQuat_new()
{
    return new btQuaternion();
}

float physQuat_getX(phys::Quat *q)
{
    return q->getX();
}
float physQuat_getY(phys::Quat *q)
{
    return q->getY();
}
float physQuat_getZ(phys::Quat *q)
{
    return q->getZ();
}
float physQuat_getW(phys::Quat *q)
{
    return q->getW();
}

float *physQuat_get(phys::Quat *q)
{
    return *q;
}

void physQuat_set(phys::Quat *q, float x, float y, float z, float w)
{
    q->setValue(x, y, z, w);
}