import { Component, Node, quat, vec3 } from 'engine';
import { phys } from 'phys';
import { PhysicsSystem } from "./PhysicsSystem.js";

const physV3_a = phys.fn.physVector3_new();
const physQ_a = phys.fn.physQuat_new();
const physT_a = phys.fn.physTransform_new();

const v3_a = vec3.create();
const q_a = quat.create();

export class RigidBody extends Component {
    readonly pointer = phys.fn.physRigidBody_new();

    private _mass: number = 0;
    public get mass(): number {
        return this._mass;
    }
    public set mass(value: number) {
        const shape = phys.fn.physRigidBody_getCollisionShape(this.pointer);
        phys.fn.physCollisionShape_calculateLocalInertia(shape, value, physV3_a);
        phys.fn.physRigidBody_setMassProps(this.pointer, value, physV3_a);
        this._mass = value;
    }

    constructor(node: Node) {
        super(node);

        phys.fn.physWorld_addRigidBody(PhysicsSystem.instance.pointer, this.pointer)

        // set after addRigidBody
        this.mass = 0;
    }

    override update(): void {
        if (this.node.hasChangedFlag.value) {
            phys.fn.physTransform_identity(physT_a);

            phys.fn.physVector3_set(physV3_a, ...this.node.world_position)
            phys.fn.physTransform_setPosition(physT_a, physV3_a)

            phys.fn.physQuat_set(physQ_a, ...this.node.world_rotation);
            phys.fn.physTransform_setRotation(physT_a, physQ_a)

            phys.fn.physRigidBody_setWorldTransform(this.pointer, physT_a);
        }
    }

    override lateUpdate(): void {
        if (!this._mass) {
            return;
        }

        const transform = phys.fn.physRigidBody_getWorldTransform(this.pointer);

        const position = phys.fn.physTransform_getPosition(transform);
        vec3.set(v3_a, phys.fn.physVector3_getX(position), phys.fn.physVector3_getY(position), phys.fn.physVector3_getZ(position));
        this.node.world_position = v3_a;

        const rotation = phys.fn.physTransform_getRotation(transform);
        quat.set(q_a, phys.fn.physQuat_getX(rotation), phys.fn.physQuat_getY(rotation), phys.fn.physQuat_getZ(rotation), phys.fn.physQuat_getW(rotation));
        this.node.world_rotation = q_a;
    }
}