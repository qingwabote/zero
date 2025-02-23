#pragma once

#include <phys/type.hpp>
#include "../../../portation.h"

extern "C"
{
    PK_EXPORT phys::RigidBody *physRigidBody_new();

    PK_EXPORT phys::CollisionShape *physRigidBody_getCollisionShape(phys::RigidBody *body);

    PK_EXPORT void physRigidBody_setMassProps(phys::RigidBody *body, float mass, const phys::Vector3 *inertia);

    PK_EXPORT const phys::Transform *physRigidBody_getWorldTransform(phys::RigidBody *body);

    PK_EXPORT void physRigidBody_setWorldTransform(phys::RigidBody *body, const phys::Transform *t);

    PK_EXPORT void physRigidBody_addShape(phys::RigidBody *body, phys::CollisionShape *shape);

    PK_EXPORT void physRigidBody_updateShapeTransform(phys::RigidBody *body, phys::CollisionShape *shape, const phys::Transform *t);
}
