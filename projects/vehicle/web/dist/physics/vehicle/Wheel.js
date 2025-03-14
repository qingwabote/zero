import { Component, quat, vec3 } from "engine";
import { phys } from "phys";
const suspension_restLength = 0.6;
const physV3_a = phys.fn.physVector3_new();
const physV3_b = phys.fn.physVector3_new();
const physV3_c = phys.fn.physVector3_new();
const v3_a = vec3.create();
const q_a = quat.create();
export class Wheel extends Component {
    constructor() {
        super(...arguments);
        this._connection = vec3.create();
        this.front = false;
        this.radius = 0;
        this._index = -1;
        this._force = 0;
        this._steering = 0;
    }
    get connection() {
        return this._connection;
    }
    set connection(value) {
        vec3.copy(this._connection, value);
    }
    get force() {
        return this._force;
    }
    set force(value) {
        phys.fn.physVehicle_applyEngineForce(this.chassis.pointer, -value, this._index);
        this._force = value;
    }
    get steering() {
        return this._steering;
    }
    set steering(value) {
        phys.fn.physVehicle_setSteeringValue(this.chassis.pointer, value, this._index);
        this._steering = value;
    }
    start() {
        phys.fn.physVector3_set(physV3_a, ...this._connection);
        phys.fn.physVector3_set(physV3_b, 0, -1, 0);
        phys.fn.physVector3_set(physV3_c, -1, 0, 0);
        this._index = phys.fn.physVehicle_addWheel(this.chassis.pointer, physV3_a, physV3_b, physV3_c, suspension_restLength, 20, this.radius, this.front);
    }
    lateUpdate() {
        // phys.fn.physVehicle_updateWheelTransform(this.chassis.pointer, this._index);
        const t = phys.fn.physVehicle_getWheelTransform(this.chassis.pointer, this._index);
        const p = phys.fn.physTransform_getPosition(t);
        const q = phys.fn.physTransform_getRotation(t);
        this.node.world_position = phys.heap.cpyBuffer(v3_a, p, 'f32', 3);
        this.node.world_rotation = phys.heap.cpyBuffer(q_a, q, 'f32', 4);
    }
}
