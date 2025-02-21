#pragma once

#include <phys/type.hpp>
#include "../../../portation.h"

extern "C"
{
    PK_EXPORT phys::Vehicle *physVehicle_new(phys::World *world, phys::RigidBody *chassis);
    PK_EXPORT void physVehicle_addWheel(phys::Vehicle *vehicle, const phys::Vector3 *connectionPointCS0, const phys::Vector3 *wheelDirectionCS0, const phys::Vector3 *wheelAxleCS, float suspensionRestLength, float suspensionStiffness, float wheelRadius, bool isFrontWheel);
    PK_EXPORT void physVehicle_applyEngineForce(phys::Vehicle *vehicle, float force, int wheel);
    PK_EXPORT void physVehicle_setSteeringValue(phys::Vehicle *vehicle, float steering, int wheel);
    PK_EXPORT const phys::Transform *physVehicle_getWheelTransform(phys::Vehicle *vehicle, int wheelIndex);
}
