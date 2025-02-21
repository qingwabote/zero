#pragma once

#include <phys/type.hpp>

extern "C"
{
    phys::Transform *physTransform_new();

    void physTransform_identity(phys::Transform *t);

    const phys::Vector3 *physTransform_getPosition(phys::Transform *t);
    void physTransform_setPosition(phys::Transform *t, const phys::Vector3 *v3);

    const phys::Quat *physTransform_getRotation(phys::Transform *t);
    void physTransform_setRotation(phys::Transform *t, const phys::Quat *q);
}