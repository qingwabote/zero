#include <phys/World.hpp>
#include <BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration.h>
#include <BulletCollision/CollisionDispatch/btCollisionDispatcher.h>
#include <BulletCollision/BroadphaseCollision/btDbvtBroadphase.h>
#include <BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver.h>

phys::World *physWorld_new()
{
    btDefaultCollisionConfiguration *configuration = new btDefaultCollisionConfiguration();
    btCollisionDispatcher *dispatcher = new btCollisionDispatcher(configuration);
    btDbvtBroadphase *broadphase = new btDbvtBroadphase();
    btSequentialImpulseConstraintSolver *solver = new btSequentialImpulseConstraintSolver();
    return new btDiscreteDynamicsWorld(dispatcher, broadphase, solver, configuration);
}

int physWorld_stepSimulation(phys::World *world, float timeStep, int maxSubSteps, float fixedTimeStep)
{
    return world->stepSimulation(timeStep, maxSubSteps, fixedTimeStep);
}

void physWorld_addRigidBody(phys::World *world, phys::RigidBody *body)
{
    world->addRigidBody(body);
}
