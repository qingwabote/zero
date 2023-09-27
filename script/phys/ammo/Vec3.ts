import { impl as ammo } from "./context.js";

export class Vec3 {
    get x(): number {
        return this.impl.x()
    }

    get y(): number {
        return this.impl.y()
    }

    get z(): number {
        return this.impl.z()
    }

    constructor(public impl = new ammo.btVector3(0, 0, 0)) { }

    set(x: number, y: number, z: number): void {
        this.impl.setValue(x, y, z);
    }
}