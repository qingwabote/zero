import RayResultCallback from "./RayResultCallback.js";

export default class ClosestRayResultCallback extends RayResultCallback {
    protected override createImpl(): any {
        return new this._context.ammo.ClosestRayResultCallback();
    }
}