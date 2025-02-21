#pragma once

#include <phys/type.hpp>
#include "../../../portation.h"

extern "C"
{
    PK_EXPORT phys::World *physWorld_new();

    PK_EXPORT int physWorld_stepSimulation(phys::World *world, float timeStep, int maxSubSteps, float fixedTimeStep);

    PK_EXPORT void physWorld_addRigidBody(phys::World *world, phys::RigidBody *body);
}
