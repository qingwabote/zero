#pragma once

#include <phys/type.hpp>
#include "../../../portation.h"

extern "C"
{
    PK_EXPORT phys::Transform *physTransform_new();

    PK_EXPORT void physTransform_identity(phys::Transform *t);

    PK_EXPORT const phys::Vector3 *physTransform_getPosition(phys::Transform *t);
    PK_EXPORT void physTransform_setPosition(phys::Transform *t, const phys::Vector3 *v3);

    PK_EXPORT const phys::Quat *physTransform_getRotation(phys::Transform *t);
    PK_EXPORT void physTransform_setRotation(phys::Transform *t, const phys::Quat *q);
}