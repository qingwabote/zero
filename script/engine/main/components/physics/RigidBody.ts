import { Component } from "../../core/Component.js";
import { quat } from "../../core/math/quat.js";
import { vec3 } from "../../core/math/vec3.js";
import { Node } from "../../core/Node.js";
import { PhysicsSystem } from "../../physics/PhysicsSystem.js";

export class RigidBody extends Component {
    readonly impl: any;

    private _mass: number = 0;
    public get mass(): number {
        return this._mass;
    }
    public set mass(value: number) {
        const context = PhysicsSystem.instance;
        const ammo = context.ammo;

        const shape = ammo.castObject(this.impl.getCollisionShape(), ammo.btCompoundShape)

        context.bt_vec3_a.setValue(0, 0, 0);
        shape.calculateLocalInertia(value, context.bt_vec3_a);
        this.impl.setMassProps(value, context.bt_vec3_a);

        this._mass = value;
    }

    constructor(node: Node) {
        super(node);
        const context = PhysicsSystem.instance;
        const ammo = context.ammo;

        const motionState = new ammo.MotionState();
        motionState.getWorldTransform = (ptr_bt_transform: number) => {
            // const bt_transform = ammo.wrapPointer(ptr_bt_transform, ammo.btTransform);
            // ps.bt_vec3_a.setValue(...node.world_position);
            // bt_transform.setOrigin(ps.bt_vec3_a);

            // ps.bt_quat_a.setValue(...node.world_rotation);
            // bt_transform.setRotation(ps.bt_quat_a);
        }
        motionState.setWorldTransform = (ptr_bt_transform: number) => {
            // const bt_transform = ammo.wrapPointer(ptr_bt_transform, ammo.btTransform);
            // https://github.com/bulletphysics/bullet3/issues/1104#issuecomment-300428776
            const bt_transform = this.impl.getWorldTransform();
            const origin = bt_transform.getOrigin();
            node.world_position = vec3.create(origin.x(), origin.y(), origin.z());
            const rotation = bt_transform.getRotation();
            node.world_rotation = quat.create(rotation.x(), rotation.y(), rotation.z(), rotation.w());
        }

        const compoundShape = new ammo.btCompoundShape();

        const info = new ammo.btRigidBodyConstructionInfo(1, motionState, compoundShape);
        this.impl = new ammo.btRigidBody(info);
        ammo.destroy(info);

        context.world.impl.addRigidBody(this.impl);

        context.bt_vec3_a.setValue(0, 0, 0);
        this.impl.setMassProps(0, context.bt_vec3_a);
    }

    override update(): void {
        if (this.node.hasChanged) {
            const ps = PhysicsSystem.instance;

            ps.bt_transform_a.setIdentity();

            ps.bt_vec3_a.setValue(...this.node.world_position);
            ps.bt_transform_a.setOrigin(ps.bt_vec3_a);

            ps.bt_quat_a.setValue(...this.node.world_rotation);
            ps.bt_transform_a.setRotation(ps.bt_quat_a);

            this.impl.setWorldTransform(ps.bt_transform_a);
        }
    }
}