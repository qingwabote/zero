import Component from "../../Component.js";
import vec3, { Vec3 } from "../../math/vec3.js";
import PhysicsSystem from "../../physics/PhysicsSystem.js";
import RigidBody from "./RigidBody.js";

export default class BoxShape extends Component {
    size: Vec3 = vec3.create(100, 100, 100);

    origin: Vec3 = vec3.create(0, 0, 0);

    private _impl: any;

    override start(): void {
        let body = this.node.getComponent(RigidBody);
        if (!body) {
            body = this.node.addComponent(RigidBody);
        }

        const ps = PhysicsSystem.instance;
        const ammo = ps.ammo;

        ps.bt_vec3_a.setValue(this.size[0] / 2, this.size[1] / 2, this.size[2] / 2);
        this._impl = new ammo.btBoxShape(ps.bt_vec3_a);
        ps.bt_transform_a.setIdentity();
        ps.bt_vec3_a.setValue(...this.origin);
        ps.bt_transform_a.setOrigin(ps.bt_vec3_a);
        ammo.castObject(body.impl.getCollisionShape(), ammo.btCompoundShape).addChildShape(ps.bt_transform_a, this._impl);
    }
}