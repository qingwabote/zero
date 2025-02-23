#include <phys/RigidBody.hpp>
#include <BulletDynamics/Dynamics/btRigidBody.h>
#include <BulletCollision/CollisionShapes/btCompoundShape.h>
#include <LinearMath/btTransform.h>

phys::RigidBody *physRigidBody_new()
{
    btCompoundShape *compound = new btCompoundShape();
    btRigidBody::btRigidBodyConstructionInfo info(1.0, nullptr, compound);

    return new btRigidBody(info);
}

phys::CollisionShape *physRigidBody_getCollisionShape(phys::RigidBody *body)
{
    return body->getCollisionShape();
}

void physRigidBody_setMassProps(phys::RigidBody *body, float mass, const phys::Vector3 *inertia)
{
    body->setMassProps(mass, *inertia);
}

const phys::Transform *physRigidBody_getWorldTransform(phys::RigidBody *body)
{
    return &body->getWorldTransform();
}

void physRigidBody_setWorldTransform(phys::RigidBody *body, const phys::Transform *t)
{
    body->setWorldTransform(*t);
}

void physRigidBody_addShape(phys::RigidBody *body, phys::CollisionShape *shape)
{
    btTransform t;
    t.setIdentity();
    reinterpret_cast<btCompoundShape *>(body->getCollisionShape())->addChildShape(t, shape);
}

void physRigidBody_updateShapeTransform(phys::RigidBody *body, phys::CollisionShape *shape, const phys::Transform *t)
{
    btCompoundShape *compound = reinterpret_cast<btCompoundShape *>(body->getCollisionShape());
    int num = compound->getNumChildShapes();
    int i;
    for (i = 0; i < num; i++)
    {
        if (shape == compound->getChildShape(i))
        {
            break;
        }
    }
    compound->updateChildTransform(i, *t);
}
