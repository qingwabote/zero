#pragma once

#include <BulletDynamics/Dynamics/btDiscreteDynamicsWorld.h>
#include <BulletCollision/CollisionShapes/btCompoundShape.h>
#include <BulletCollision/CollisionShapes/btBoxShape.h>

namespace phys
{
    typedef btVector3 Vector3;
    typedef btQuaternion Quat;
    typedef btTransform Transform;

    typedef btDiscreteDynamicsWorld World;
    typedef btCollisionShape CollisionShape;
    typedef btCompoundShape CompoundShape;
    typedef btBoxShape BoxShape;
    typedef btRigidBody RigidBody;
}