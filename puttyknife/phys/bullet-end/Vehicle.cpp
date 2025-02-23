#include <phys/Vehicle.hpp>

namespace
{
    btRaycastVehicle::btVehicleTuning tuning;
}

phys::Vehicle *physVehicle_new(phys::World *world, phys::RigidBody *chassis)
{
    btDefaultVehicleRaycaster *raycaster = new btDefaultVehicleRaycaster(world);
    btRaycastVehicle *vehicle = new btRaycastVehicle(tuning, chassis, raycaster);
    vehicle->setCoordinateSystem(0, 1, 2);
    world->addVehicle(vehicle);
    return vehicle;
}

void physVehicle_addWheel(phys::Vehicle *vehicle, const phys::Vector3 *connectionPointCS0, const phys::Vector3 *wheelDirectionCS0, const phys::Vector3 *wheelAxleCS, float suspensionRestLength, float suspensionStiffness, float wheelRadius, bool isFrontWheel)
{
    tuning.m_suspensionStiffness = suspensionStiffness;
    vehicle->addWheel(*connectionPointCS0, *wheelDirectionCS0, *wheelAxleCS, suspensionRestLength, wheelRadius, tuning, isFrontWheel);
}

void physVehicle_applyEngineForce(phys::Vehicle *vehicle, float force, int wheel)
{
    vehicle->applyEngineForce(force, wheel);
}

void physVehicle_setSteeringValue(phys::Vehicle *vehicle, float steering, int wheel)
{
    vehicle->setSteeringValue(steering, wheel);
}

const phys::Transform *physVehicle_getWheelTransform(phys::Vehicle *vehicle, int wheelIndex)
{
    return &vehicle->getWheelTransformWS(wheelIndex);
}
