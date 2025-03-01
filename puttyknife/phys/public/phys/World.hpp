#pragma once

#include <phys/type.hpp>
#include "../../../portation.h"
#include <functional>

namespace phys
{
    typedef std::function<void(const phys::Vector3 &, const phys::Vector3 &, const phys::Vector3 &)> DrawLineFunc;
}

extern "C"
{
    PK_EXPORT phys::World *physWorld_new();

    PK_EXPORT int physWorld_stepSimulation(phys::World *world, float timeStep, int maxSubSteps, float fixedTimeStep);

    PK_EXPORT void physWorld_addRigidBody(phys::World *world, phys::RigidBody *body);

    void physWorld_setDebugDrawer(phys::World *world, phys::DrawLineFunc &&drawLineFunc);
}
