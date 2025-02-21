#pragma once

#include <phys/type.hpp>

extern "C"
{
    phys::RigidBody *physRigidBody_new();

    phys::CollisionShape *physRigidBody_getCollisionShape(phys::RigidBody *body);

    void physRigidBody_setMassProps(phys::RigidBody *body, float mass, const phys::Vector3 *inertia);

    const phys::Transform *physRigidBody_getWorldTransform(phys::RigidBody *body);

    void physRigidBody_setWorldTransform(phys::RigidBody *body, const phys::Transform *t);

    void physRigidBody_addShape(phys::RigidBody *body, phys::CollisionShape *shape);

    void physRigidBody_updateShapeTransform(phys::RigidBody *body, phys::CollisionShape *shape, const phys::Transform *t);
}
