import { Vec3 } from "./Vec3.js";
export class Shape {
    get scale() {
        this._scale.impl = this.impl.getLocalScaling();
        return this._scale;
    }
    set scale(value) {
        this.impl.setLocalScaling(value.impl);
    }
    constructor(impl) {
        this.impl = impl;
        this._scale = new Vec3(null);
    }
}
