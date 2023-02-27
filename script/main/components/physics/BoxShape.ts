import Component from "../../core/Component.js";
import vec3, { Vec3 } from "../../core/math/vec3.js";
import Node, { TransformBit } from "../../core/Node.js";
import PhysicsSystem from "../../physics/PhysicsSystem.js";
import RigidBody from "./RigidBody.js";

enum DirtyFlagBits {
    NONE = 0,
    SCALE = 1 << 0,
    ORIGIN = 1 << 1,
    ALL = 0xffffffff
}

export default class BoxShape extends Component {
    private _dirtyFlags = DirtyFlagBits.ALL;

    private _size: Vec3 = vec3.create(0, 0, 0);
    public get size(): Vec3 {
        return this._size;
    }
    public set size(value: Vec3) {
        this._size = value;
        this._dirtyFlags |= DirtyFlagBits.SCALE;
    }

    private _origin: Vec3 = vec3.create(0, 0, 0);
    public get origin(): Vec3 {
        return this._origin;
    }
    public set origin(value: Vec3) {
        this._origin = value;
        this._dirtyFlags |= DirtyFlagBits.ORIGIN;
    }

    readonly body: RigidBody;

    private _impl: any;

    constructor(node: Node) {
        super(node);

        let body = this.node.getComponent(RigidBody);
        if (!body) {
            body = this.node.addComponent(RigidBody);
        }

        const ps = PhysicsSystem.instance;
        const ammo = ps.ammo;

        ps.bt_vec3_a.setValue(0.5, 0.5, 0.5); // using unit-scale shape https://pybullet.org/Bullet/phpBB3/viewtopic.php?p=20760#p20760
        this._impl = new ammo.btBoxShape(ps.bt_vec3_a);
        ps.bt_transform_a.setIdentity();
        ammo.castObject(body.impl.getCollisionShape(), ammo.btCompoundShape).addChildShape(ps.bt_transform_a, this._impl);

        this.body = body;
    }

    override update(): void {
        const ps = PhysicsSystem.instance;
        const ammo = ps.ammo;

        if (this.node.hasChanged & TransformBit.SCALE) {
            this._dirtyFlags |= DirtyFlagBits.SCALE;
        }

        if (this._dirtyFlags & DirtyFlagBits.SCALE) {
            const scale = vec3.multiply(vec3.create(), this._size, this.node.world_scale);
            ps.bt_vec3_a.setValue(...scale);
            this._impl.setLocalScaling(ps.bt_vec3_a);
        }

        if (this._dirtyFlags & DirtyFlagBits.ORIGIN) {
            ps.bt_vec3_a.setValue(...this._origin);
            ps.bt_transform_a.setIdentity();
            ps.bt_transform_a.setOrigin(ps.bt_vec3_a);
            const body = this.node.getComponent(RigidBody)!;
            const compound = ammo.castObject(body.impl.getCollisionShape(), ammo.btCompoundShape);
            compound.updateChildTransform(this.getIndex(), ps.bt_transform_a);
        }

        this._dirtyFlags = DirtyFlagBits.NONE;
    }

    private getIndex(): number {
        const ps = PhysicsSystem.instance;
        const ammo = ps.ammo;

        const body = this.node.getComponent(RigidBody)!;
        const compound = ammo.castObject(body.impl.getCollisionShape(), ammo.btCompoundShape);
        for (let i = 0; i < compound.getNumChildShapes(); i++) {
            if (ammo.compare(compound.getChildShape(i), this._impl)) {
                return i;
            }
        }
        return -1;
    }
}