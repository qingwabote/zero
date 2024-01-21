import { impl as ammo } from "./context.js";
export class Quat {
    get x() {
        return this.impl.x();
    }
    get y() {
        return this.impl.y();
    }
    get z() {
        return this.impl.z();
    }
    get w() {
        return this.impl.w();
    }
    constructor(impl = new ammo.btQuaternion(0, 0, 0, 1)) {
        this.impl = impl;
    }
    set(x, y, z, w) {
        this.impl.setValue(x, y, z, w);
    }
}
