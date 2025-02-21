#pragma once

#include <phys/type.hpp>
#include "../../../portation.h"

extern "C"
{
    PK_EXPORT void physCollisionObject_setActivationState(phys::CollisionObject *object, int newState);
}
