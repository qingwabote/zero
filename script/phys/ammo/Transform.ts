import { Quat } from "./Quat.js";
import { Vec3 } from "./Vec3.js";
import { impl as ammo } from "./context.js";

export class Transform {
    private _position = new Vec3(null);
    get position(): Vec3 {
        this._position.impl = this.impl.getOrigin();
        return this._position;
    }
    set position(value: Vec3) {
        this.impl.setOrigin(value.impl);
    }

    private _rotation = new Quat(null);
    get rotation(): Quat {
        this._rotation.impl = this.impl.getRotation();
        return this._rotation;
    }
    set rotation(value: Quat) {
        this.impl.setRotation(value.impl);
    }

    constructor(public impl = new ammo.btTransform()) { }

    identity() {
        this.impl.setIdentity();
    }
}