import Component from "../../Component.js";
import Node from "../../Node.js";
import PhysicsSystem from "../../physics/PhysicsSystem.js";

export default class RigidBody extends Component {
    readonly impl: any;

    constructor(node: Node) {
        super(node);
        const ps = PhysicsSystem.instance;
        const ammo = ps.ammo;

        const motionState = new ammo.MotionState();
        motionState.getWorldTransform = (ptr_bt_transform: number) => {
            // const bt_transform = ammo.wrapPointer(ptr_bt_transform, ammo.btTransform);
            // ps.bt_vec3_a.setValue(...node.world_position);
            // bt_transform.setOrigin(ps.bt_vec3_a);

            // ps.bt_quat_a.setValue(...node.world_rotation);
            // bt_transform.setRotation(ps.bt_quat_a);
        }
        motionState.setWorldTransform = (ptr_bt_transform: number) => {
            console.log("setWorldTransform")
            // const bt_transform = ammo.wrapPointer(ptr_bt_transform, ammo.btTransform);
            // const origin = bt_transform.getOrigin();
            // node.world_position = vec3.create(origin.x(), origin.y(), origin.z());
        }

        const compoundShape = new ammo.btCompoundShape();

        const info = new ammo.btRigidBodyConstructionInfo(0, motionState, compoundShape);
        this.impl = new ammo.btRigidBody(info);
        ammo.destroy(info);

        ps.world.impl.addRigidBody(this.impl);
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