#include <phys/World.hpp>
#include <BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration.h>
#include <BulletCollision/CollisionDispatch/btCollisionDispatcher.h>
#include <BulletCollision/BroadphaseCollision/btDbvtBroadphase.h>
#include <BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver.h>
#include <LinearMath/btIDebugDraw.h>

namespace phys
{
    class DebugDrawer : public btIDebugDraw
    {
    private:
        phys::DrawLineFunc _drawLineFunc;

    public:
        DebugDrawer(phys::DrawLineFunc &&drawLineFunc) : _drawLineFunc(std::move(drawLineFunc)) {}

        virtual void drawLine(const btVector3 &from, const btVector3 &to, const btVector3 &color) override
        {
            _drawLineFunc(from, to, color);
        }

        virtual void drawContactPoint(const btVector3 &PointOnB, const btVector3 &normalOnB, btScalar distance, int lifeTime, const btVector3 &color) override {}

        virtual void reportErrorWarning(const char *warningString) override {};

        virtual void draw3dText(const btVector3 &location, const char *textString) override {};

        virtual void setDebugMode(int debugMode) override {};

        virtual int getDebugMode() const override
        {
            return btIDebugDraw::DBG_MAX_DEBUG_DRAW_MODE;
        };

        ~DebugDrawer() {}
    };
}

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
    int res = world->stepSimulation(timeStep, maxSubSteps, fixedTimeStep);
    world->debugDrawWorld();
    return res;
}

void physWorld_addRigidBody(phys::World *world, phys::RigidBody *body)
{
    world->addRigidBody(body);
}

void physWorld_setDebugDrawer(phys::World *world, phys::DrawLineFunc &&drawLineFunc)
{
    btIDebugDraw *drawer = world->getDebugDrawer();
    if (drawer)
    {
        delete drawer;
    }

    drawer = new phys::DebugDrawer(std::move(drawLineFunc));
    world->setDebugDrawer(drawer);
}
