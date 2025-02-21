#pragma once

#include <phys/type.hpp>

extern "C"
{
    void physCollisionShape_calculateLocalInertia(phys::CollisionShape *shape, float mass, phys::Vector3 *v3);

    void physCollisionShape_setScale(phys::CollisionShape *shape, const phys::Vector3 *scale);

    const phys::Vector3 *physCollisionShape_getScale(phys::CollisionShape *shape);
}
