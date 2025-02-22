#pragma once

#include <phys/type.hpp>
#include "../../../portation.h"

extern "C"
{
    PK_EXPORT void physCollisionShape_calculateLocalInertia(phys::CollisionShape *shape, float mass, phys::Vector3 *v3);

    PK_EXPORT void physCollisionShape_setScale(phys::CollisionShape *shape, const phys::Vector3 *scale);

    PK_EXPORT const phys::Vector3 *physCollisionShape_getScale(phys::CollisionShape *shape);
}
