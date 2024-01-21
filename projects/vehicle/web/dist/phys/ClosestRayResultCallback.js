import { RayResultCallback } from "./RayResultCallback.js";
import { impl } from "./context.js";
export class ClosestRayResultCallback extends RayResultCallback {
    constructor() {
        super(new impl.ClosestRayResultCallback());
    }
}
