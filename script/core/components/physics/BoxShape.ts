import Component from "../../Component.js";
import vec3, { Vec3 } from "../../math/vec3.js";
import PhysicsSystem from "../../physics/PhysicsSystem.js";
import RigidBody from "./RigidBody.js";

export default class BoxShape extends Component {
    size: Vec3 = vec3.create(1, 1, 1);

    private _impl: any;

    override start(): void {
        let body = this.node.getComponent(RigidBody);
        if (!body) {
            body = this.node.addComponent(RigidBody);
        }

        const physicsSystem = PhysicsSystem.instance;
        const ammo = physicsSystem.ammo;

        physicsSystem.bt_vec3_a.setValue(this.size[0] / 2, this.size[1] / 2, this.size[2] / 2);
        this._impl = new ammo.btBoxShape(physicsSystem.bt_vec3_a);
    }
}