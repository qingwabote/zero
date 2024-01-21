import { impl as ammo } from "./context.js";
export class Vec3 {
    get x() {
        return this.impl.x();
    }
    get y() {
        return this.impl.y();
    }
    get z() {
        return this.impl.z();
    }
    constructor(impl = new ammo.btVector3(0, 0, 0)) {
        this.impl = impl;
    }
    set(x, y, z) {
        this.impl.setValue(x, y, z);
    }
}
