import { Component, quat, vec3 } from 'engine';
import { phys } from 'phys';
import { World } from './World.js';
const physV3_a = phys.fn.physVector3_new();
const physQ_a = phys.fn.physQuat_new();
const physT_a = phys.fn.physTransform_new();
const v3_a = vec3.create();
const q_a = quat.create();
export class RigidBody extends Component {
    get mass() {
        return this._mass;
    }
    set mass(value) {
        const shape = phys.fn.physRigidBody_getCollisionShape(this.pointer);
        phys.fn.physCollisionShape_calculateLocalInertia(shape, value, physV3_a);
        phys.fn.physRigidBody_setMassProps(this.pointer, value, physV3_a);
        this._mass = value;
    }
    constructor(node) {
        super(node);
        this.pointer = phys.fn.physRigidBody_new();
        this._mass = 0;
        this._shapes = new Set;
        World.instance.addRigidBody(this);
        // set after addRigidBody
        this.mass = 0;
    }
    addShape(shape) {
        phys.fn.physRigidBody_addShape(this.pointer, shape.pointer);
        this._shapes.add(shape);
    }
    ping() {
        if (this.node.hasChangedFlag.value) {
            phys.fn.physTransform_identity(physT_a);
            phys.fn.physVector3_set(physV3_a, ...this.node.world_position);
            phys.fn.physTransform_setPosition(physT_a, physV3_a);
            phys.fn.physQuat_set(physQ_a, ...this.node.world_rotation);
            phys.fn.physTransform_setRotation(physT_a, physQ_a);
            phys.fn.physRigidBody_setWorldTransform(this.pointer, physT_a);
            const shape = phys.fn.physRigidBody_getCollisionShape(this.pointer);
            phys.fn.physVector3_set(physV3_a, ...this.node.world_scale);
            phys.fn.physCollisionShape_setScale(shape, physV3_a);
        }
    }
    pong() {
        if (!this._mass) {
            return;
        }
        const transform = phys.fn.physRigidBody_getWorldTransform(this.pointer);
        const position = phys.fn.physTransform_getPosition(transform);
        this.node.world_position = phys.heap.cpyBuffer(v3_a, phys.fn.physVector3_get(position), 'f32', 3);
        const rotation = phys.fn.physTransform_getRotation(transform);
        this.node.world_rotation = phys.heap.cpyBuffer(q_a, phys.fn.physQuat_get(rotation), 'f32', 4);
    }
}
