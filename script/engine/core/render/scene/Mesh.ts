import { AABB3D, aabb3d } from "../../math/aabb3d.js";
import { Vec3, vec3 } from "../../math/vec3.js";
import { ChangeRecord } from "./ChangeRecord.js";
import { SubMesh } from "./SubMesh.js";

export class Mesh extends ChangeRecord {
    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        return this._bounds;
    }

    constructor(
        readonly subMeshes: readonly SubMesh[],
        pointMin = vec3.ZERO,
        pointMax = vec3.ZERO,
    ) {
        super();
        this.setBoundsByPoints(pointMin, pointMax);
    }

    setBoundsByPoints(min: Readonly<Vec3>, max: Readonly<Vec3>) {
        aabb3d.fromExtremes(this._bounds, min, max);
        this.hasChanged = 1;
    }

    setBoundsByRect(offset: Readonly<Vec3>, size: Readonly<Vec3>) {
        aabb3d.fromRect(this._bounds, offset, size);
        this.hasChanged = 1;
    }
}