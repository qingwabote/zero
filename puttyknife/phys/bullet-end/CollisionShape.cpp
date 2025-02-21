#include <phys/CollisionShape.hpp>
#include <BulletCollision/CollisionShapes/btCollisionShape.h>

void physCollisionShape_calculateLocalInertia(phys::CollisionShape *shape, float mass, phys::Vector3 *v3)
{
    shape->calculateLocalInertia(mass, *v3);
}

void physCollisionShape_setScale(phys::CollisionShape *shape, const phys::Vector3 *scale)
{
    shape->setLocalScaling(*scale);
}

const phys::Vector3 *physCollisionShape_getScale(phys::CollisionShape *shape)
{
    return &shape->getLocalScaling();
}