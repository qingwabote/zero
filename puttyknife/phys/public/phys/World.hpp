#pragma once

#include <phys/type.hpp>

extern "C"
{
    phys::World *physWorld_new();

    int physWorld_stepSimulation(phys::World *world, float timeStep, int maxSubSteps, float fixedTimeStep);

    void physWorld_addRigidBody(phys::World *world, phys::RigidBody *body);
}
