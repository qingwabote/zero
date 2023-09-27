import { Vec3 } from "./Vec3.js";

export abstract class Shape {
    private _scale = new Vec3(null);
    get scale(): Vec3 {
        this._scale.impl = this.impl.getLocalScaling();
        return this._scale;
    }
    set scale(value: Vec3) {
        this.impl.setLocalScaling(value.impl)
    }

    constructor(readonly impl: any) { }
}