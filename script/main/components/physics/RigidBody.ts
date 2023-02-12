import Component from "../../Component.js";
import Node from "../../Node.js";
import PhysicsSystem from "../../physics/PhysicsSystem.js";

export default class RigidBody extends Component {
    readonly impl: any;

    constructor(node: Node) {
        super(node);
        const ps = PhysicsSystem.instance;
        const ammo = ps.ammo;

        ps.bt_vec3_a.setValue(...node.world_position);
        ps.bt_transform_a.setOrigin(ps.bt_vec3_a);

        ps.bt_quat_a.setValue(...node.world_rotation);
        ps.bt_transform_a.setRotation(ps.bt_quat_a);

        const motionState = new ammo.btDefaultMotionState(ps.bt_transform_a);

        const compoundShape = new ammo.btCompoundShape();

        const info = new ammo.btRigidBodyConstructionInfo(0, motionState, compoundShape);
        this.impl = new ammo.btRigidBody(info);
        ammo.destroy(info);

        ps.world.impl.addRigidBody(this.impl);
    }
}