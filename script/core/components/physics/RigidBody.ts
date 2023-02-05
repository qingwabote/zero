import Component from "../../Component.js";
import PhysicsSystem from "../../physics/PhysicsSystem.js";

export default class RigidBody extends Component {
    private _impl: any;
    get impl(): any {
        return this._impl;
    }

    override start(): void {
        const ps = PhysicsSystem.instance;
        const ammo = ps.ammo;

        ps.bt_vec3_a.setValue(...this.node.world_position);
        ps.bt_transform_a.setOrigin(ps.bt_vec3_a);

        ps.bt_quat_a.setValue(...this.node.world_rotation);
        ps.bt_transform_a.setRotation(ps.bt_quat_a);

        const motionState = new ammo.btDefaultMotionState(ps.bt_transform_a);

        const compoundShape = new ammo.btCompoundShape();

        const info = new ammo.btRigidBodyConstructionInfo(0, motionState, compoundShape);
        this._impl = new ammo.btRigidBody(info);
        ammo.destroy(info);

        ps.world.impl.addRigidBody(this._impl);
    }
}