import { aabb3d } from "../../math/aabb3d.js";
import { vec3 } from "../../math/vec3.js";
import { ChangeRecord } from "./ChangeRecord.js";
export class Mesh extends ChangeRecord {
    get bounds() {
        return this._bounds;
    }
    constructor(subMeshes, pointMin = vec3.ZERO, pointMax = vec3.ZERO) {
        super();
        this.subMeshes = subMeshes;
        this._bounds = aabb3d.create();
        this.setBoundsByExtremes(pointMin, pointMax);
    }
    setBoundsByExtremes(min, max) {
        aabb3d.fromExtremes(this._bounds, min, max);
        this.hasChanged = 1;
    }
    setBoundsByRect(offset, size) {
        aabb3d.fromRect(this._bounds, offset, size);
        this.hasChanged = 1;
    }
}
