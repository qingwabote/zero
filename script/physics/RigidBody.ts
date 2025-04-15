import { Component, Node, quat, vec3 } from 'engine';
import { pk } from 'puttyknife';
import { BoxShape } from './BoxShape.js';
import { World } from './World.js';

const physV3_a = pk.fn.physVector3_new();
const physQ_a = pk.fn.physQuat_new();
const physT_a = pk.fn.physTransform_new();

const v3_a = vec3.create();
const q_a = quat.create();

export class RigidBody extends Component {
    readonly pointer = pk.fn.physRigidBody_new();

    private _mass: number = 0;
    public get mass(): number {
        return this._mass;
    }
    public set mass(value: number) {
        const shape = pk.fn.physRigidBody_getCollisionShape(this.pointer);
        pk.fn.physCollisionShape_calculateLocalInertia(shape, value, physV3_a);
        pk.fn.physRigidBody_setMassProps(this.pointer, value, physV3_a);
        this._mass = value;
    }

    private readonly _shapes: Set<BoxShape> = new Set;

    constructor(node: Node) {
        super(node);

        World.instance.addRigidBody(this);

        // set after addRigidBody
        this.mass = 0;
    }

    public addShape(shape: BoxShape) {
        pk.fn.physRigidBody_addShape(this.pointer, shape.pointer);
        this._shapes.add(shape);
    }

    ping(): void {
        if (this.node.hasChangedFlag.value) {
            pk.fn.physTransform_identity(physT_a);

            pk.fn.physVector3_set(physV3_a, ...this.node.world_position)
            pk.fn.physTransform_setPosition(physT_a, physV3_a)

            pk.fn.physQuat_set(physQ_a, ...this.node.world_rotation);
            pk.fn.physTransform_setRotation(physT_a, physQ_a)

            pk.fn.physRigidBody_setWorldTransform(this.pointer, physT_a);

            const shape = pk.fn.physRigidBody_getCollisionShape(this.pointer);
            pk.fn.physVector3_set(physV3_a, ...this.node.world_scale)
            pk.fn.physCollisionShape_setScale(shape, physV3_a);
        }
    }

    pong(): void {
        if (!this._mass) {
            return;
        }

        const transform = pk.fn.physRigidBody_getWorldTransform(this.pointer);

        const position = pk.fn.physTransform_getPosition(transform);
        this.node.world_position = pk.heap.cpyBuffer(v3_a, pk.fn.physVector3_get(position), 'f32', 3);

        const rotation = pk.fn.physTransform_getRotation(transform);
        this.node.world_rotation = pk.heap.cpyBuffer(q_a, pk.fn.physQuat_get(rotation), 'f32', 4);
    }
}