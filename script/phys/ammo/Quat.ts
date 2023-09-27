import { impl as ammo } from "./context.js";

export class Quat {
    get x(): number {
        return this.impl.x()
    }

    get y(): number {
        return this.impl.y()
    }

    get z(): number {
        return this.impl.z()
    }

    get w(): number {
        return this.impl.w()
    }

    constructor(public impl = new ammo.btQuaternion(0, 0, 0, 1)) { }

    set(x: number, y: number, z: number, w: number): void {
        this.impl.setValue(x, y, z, w);
    }
}