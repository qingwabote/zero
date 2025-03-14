import { Component, quat, vec3 } from "engine";
import { phys } from "phys";
import { Chassis } from "./Chassis.js";

const suspension_restLength = 0.6;

const physV3_a = phys.fn.physVector3_new();
const physV3_b = phys.fn.physVector3_new();
const physV3_c = phys.fn.physVector3_new();

const v3_a = vec3.create();
const q_a = quat.create();

export class Wheel extends Component {
    private _connection = vec3.create();
    public get connection() {
        return this._connection;
    }
    public set connection(value) {
        vec3.copy(this._connection, value);
    }

    front = false;

    radius = 0;

    chassis!: Chassis;


    private _index = -1;

    private _force: number = 0;
    public get force(): number {
        return this._force;
    }
    public set force(value: number) {
        phys.fn.physVehicle_applyEngineForce(this.chassis.pointer, -value, this._index);
        this._force = value;
    }

    private _steering: number = 0;
    public get steering(): number {
        return this._steering;
    }
    public set steering(value: number) {
        phys.fn.physVehicle_setSteeringValue(this.chassis.pointer, value, this._index);
        this._steering = value;
    }

    start(): void {
        phys.fn.physVector3_set(physV3_a, ...this._connection)
        phys.fn.physVector3_set(physV3_b, 0, -1, 0)
        phys.fn.physVector3_set(physV3_c, -1, 0, 0)
        this._index = phys.fn.physVehicle_addWheel(this.chassis.pointer, physV3_a, physV3_b, physV3_c, suspension_restLength, 20, this.radius, this.front)
    }

    override lateUpdate(): void {
        // phys.fn.physVehicle_updateWheelTransform(this.chassis.pointer, this._index);
        const t = phys.fn.physVehicle_getWheelTransform(this.chassis.pointer, this._index);
        const p = phys.fn.physTransform_getPosition(t);
        const q = phys.fn.physTransform_getRotation(t);
        this.node.world_position = phys.heap.cpyBuffer(v3_a, p, 'f32', 3);
        this.node.world_rotation = phys.heap.cpyBuffer(q_a, q, 'f32', 4);
    }
}