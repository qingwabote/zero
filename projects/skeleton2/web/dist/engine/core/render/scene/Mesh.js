import { aabb3d } from "../../math/aabb3d.js";
import { vec3 } from "../../math/vec3.js";
import { Periodic } from "./Periodic.js";
export class Mesh {
    get bounds() {
        return this._bounds;
    }
    get hasChanged() {
        return this._hasChangedFlag.value;
    }
    constructor(subMeshes, pointMin = vec3.ZERO, pointMax = vec3.ZERO) {
        this.subMeshes = subMeshes;
        this._bounds = aabb3d.create();
        this._hasChangedFlag = new Periodic(0, 0);
        this.setBoundsByExtremes(pointMin, pointMax);
    }
    setBoundsByExtremes(min, max) {
        aabb3d.fromExtremes(this._bounds, min, max);
        this._hasChangedFlag.value = 1;
    }
    setBoundsByRect(offset, size) {
        aabb3d.fromRect(this._bounds, offset, size);
        this._hasChangedFlag.value = 1;
    }
}
