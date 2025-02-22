#include <phys/CollisionObject.hpp>

void physCollisionObject_setActivationState(phys::CollisionObject *object, int newState)
{
    object->setActivationState(newState);
}
