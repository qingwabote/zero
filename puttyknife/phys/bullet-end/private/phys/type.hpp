#pragma once

#include <BulletCollision/CollisionShapes/btCompoundShape.h>
#include <BulletCollision/CollisionShapes/btBoxShape.h>
#include <BulletDynamics/Dynamics/btDiscreteDynamicsWorld.h>
#include <BulletDynamics/Vehicle/btRaycastVehicle.h>

namespace phys
{
    typedef btVector3 Vector3;
    typedef btQuaternion Quat;
    typedef btTransform Transform;

    typedef btCollisionObject CollisionObject;

    typedef btDiscreteDynamicsWorld World;
    typedef btCollisionShape CollisionShape;
    typedef btCompoundShape CompoundShape;
    typedef btBoxShape BoxShape;
    typedef btRigidBody RigidBody;

    typedef btRaycastVehicle Vehicle;
}