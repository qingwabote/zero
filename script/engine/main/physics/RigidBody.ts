import * as phys from 'phys';
import { Component } from "../core/Component.js";
import { Node } from "../core/Node.js";
import { quat } from "../core/math/quat.js";
import { vec3 } from "../core/math/vec3.js";
import { PhysicsSystem } from "./PhysicsSystem.js";

const phys_transform_a = new phys.Transform();
const phys_vec3_a = new phys.Vec3();
const phys_quat_a = new phys.Quat();

export class RigidBody extends Component {
    readonly impl: phys.RigidBody;

    public get mass(): number {
        return this.impl.mass;
    }
    public set mass(value: number) {
        this.impl.mass = value;
    }

    constructor(node: Node) {
        super(node);

        const motionState = new phys.MotionState();
        motionState.getWorldTransform = () => {
            // const bt_transform = ammo.wrapPointer(ptr_bt_transform, ammo.btTransform);
            // ps.bt_vec3_a.setValue(...node.world_position);
            // bt_transform.setOrigin(ps.bt_vec3_a);

            // ps.bt_quat_a.setValue(...node.world_rotation);
            // bt_transform.setRotation(ps.bt_quat_a);
        }
        motionState.setWorldTransform = () => {
            // const bt_transform = ammo.wrapPointer(ptr_bt_transform, ammo.btTransform);
            // https://github.com/bulletphysics/bullet3/issues/1104#issuecomment-300428776
            const bt_transform = this.impl.worldTransform;
            const origin = bt_transform.position;
            node.world_position = vec3.create(origin.x, origin.y, origin.z);
            const rotation = bt_transform.rotation
            node.world_rotation = quat.create(rotation.x, rotation.y, rotation.z, rotation.w);
        }

        this.impl = new phys.RigidBody(motionState)

        PhysicsSystem.instance.world.addRigidBody(this.impl);

        // set after addRigidBody
        this.impl.mass = 0;
    }

    override update(): void {
        if (this.node.hasChanged) {
            phys_transform_a.identity()

            phys_vec3_a.set(...this.node.world_position);
            phys_transform_a.position = phys_vec3_a;

            phys_quat_a.set(...this.node.world_rotation);
            phys_transform_a.rotation = phys_quat_a;

            this.impl.worldTransform = phys_transform_a;
        }
    }
}