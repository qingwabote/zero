import { Quat } from "./Quat.js";
import { Vec3 } from "./Vec3.js";
import { impl as ammo } from "./context.js";
export class Transform {
    get position() {
        this._position.impl = this.impl.getOrigin();
        return this._position;
    }
    set position(value) {
        this.impl.setOrigin(value.impl);
    }
    get rotation() {
        this._rotation.impl = this.impl.getRotation();
        return this._rotation;
    }
    set rotation(value) {
        this.impl.setRotation(value.impl);
    }
    constructor(impl = new ammo.btTransform()) {
        this.impl = impl;
        this._position = new Vec3(null);
        this._rotation = new Quat(null);
    }
    identity() {
        this.impl.setIdentity();
    }
}
