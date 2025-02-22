#include <phys/Transform.hpp>
#include <LinearMath/btTransform.h>

phys::Transform *physTransform_new()
{
    return new btTransform();
}

void physTransform_identity(phys::Transform *t)
{
    t->setIdentity();
}

const phys::Vector3 *physTransform_getPosition(phys::Transform *t)
{
    return &t->getOrigin();
}

void physTransform_setPosition(phys::Transform *t, const phys::Vector3 *v3)
{
    t->setOrigin(*v3);
}

const phys::Quat *physTransform_getRotation(phys::Transform *t)
{
    static btQuaternion temp;
    temp = t->getRotation();
    return &temp;
}

void physTransform_setRotation(phys::Transform *t, const phys::Quat *q)
{
    t->setRotation(*q);
}