import { RayResultCallback } from "./RayResultCallback.js";
import { ammo } from "./internal/ammo.js";

export class ClosestRayResultCallback extends RayResultCallback {
    protected override createImpl(): any {
        return new ammo.ClosestRayResultCallback();
    }
}