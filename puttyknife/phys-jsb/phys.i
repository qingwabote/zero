%module puttyknife_phys_swig

%include "../jsb/bigint_ptr.i"

%ignore physWorld_setDebugDrawer;

#define PK_EXPORT

%bigint_ptr(float)

%bigint_ptr(phys::Vector3)
%bigint_ptr(phys::Quat)
%bigint_ptr(phys::Transform)
%bigint_ptr(phys::World)
%bigint_ptr(phys::CollisionObject)
%bigint_ptr(phys::CollisionShape)
%bigint_ptr(phys::BoxShape)
%bigint_ptr(phys::RigidBody)
%bigint_ptr(phys::Vehicle)

%include <phys/Vector3.hpp>
%include <phys/Quat.hpp>
%include <phys/Transform.hpp>
%include <phys/World.hpp>
%include <phys/CollisionObject.hpp>
%include <phys/CollisionShape.hpp>
%include <phys/BoxShape.hpp>
%include <phys/RigidBody.hpp>
%include <phys/Vehicle.hpp>

%{
#include <phys/Vector3.hpp>
#include <phys/Quat.hpp>
#include <phys/Transform.hpp>
#include <phys/World.hpp>
#include <phys/CollisionObject.hpp>
#include <phys/CollisionShape.hpp>
#include <phys/BoxShape.hpp>
#include <phys/RigidBody.hpp>
#include <phys/Vehicle.hpp>
%}
