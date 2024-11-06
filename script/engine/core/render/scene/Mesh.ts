import { AABB3D, aabb3d } from "../../math/aabb3d.js";
import { Vec3, vec3 } from "../../math/vec3.js";
import { Periodic } from "./Periodic.js";
import { SubMesh } from "./SubMesh.js";

export class Mesh {
    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        return this._bounds;
    }

    private _hasChangedFlag: Periodic = new Periodic(0, 0);
    get hasChanged(): number {
        return this._hasChangedFlag.value;
    }

    constructor(
        readonly subMeshes: readonly SubMesh[],
        pointMin = vec3.ZERO,
        pointMax = vec3.ZERO,
    ) {
        this.setBoundsByExtremes(pointMin, pointMax);
    }

    setBoundsByExtremes(min: Readonly<Vec3>, max: Readonly<Vec3>) {
        aabb3d.fromExtremes(this._bounds, min, max);
        this._hasChangedFlag.value = 1
    }

    setBoundsByRect(offset: Readonly<Vec3>, size: Readonly<Vec3>) {
        aabb3d.fromRect(this._bounds, offset, size);
        this._hasChangedFlag.value = 1
    }
}