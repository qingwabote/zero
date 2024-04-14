import { device } from "boot";
import { aabb3d } from "../../math/aabb3d.js";
import { frustum } from "../../math/frustum.js";
import { Mat4, mat4 } from "../../math/mat4.js";
import { vec3 } from "../../math/vec3.js";
import { DirectionalLight } from "./DirectionalLight.js";
import { FrameChangeRecord } from "./FrameChangeRecord.js";
import { Frustum } from "./Frustum.js";

const vec3_a = vec3.create();
const mat4_a = mat4.create();
const mat4_b = mat4.create();
const frustum_a = frustum.vertices();
const aabb_a = aabb3d.create();

export class DirectionalLightFurstum extends FrameChangeRecord {

    override get hasChanged(): number {
        return super.hasChanged || this._furstum.hasChanged || this._light.transform.hasChanged;
    }
    override set hasChanged(flags: number) {
        super.hasChanged = flags;
    }

    private _viewProj = mat4.create();
    public get viewProj(): Readonly<Mat4> {
        return this._viewProj;
    }

    readonly frustum: Readonly<Frustum> = new Frustum;

    index: number = 0;

    constructor(private _light: DirectionalLight, private _furstum: Readonly<Frustum>) {
        super(1);
    }

    update() {
        if (!this.hasChanged) {
            return;
        }

        mat4.fromTRS(mat4_a, vec3.ZERO, this._light.transform.world_rotation, vec3.ONE);

        frustum.transform(frustum_a, this._furstum.vertices, mat4.invert(mat4_b, mat4_a));

        aabb3d.fromPoints(aabb_a, frustum_a);

        vec3.set(vec3_a, aabb_a.center[0], aabb_a.center[1], aabb_a.center[2] + aabb_a.halfExtent[2])

        vec3.transformMat4(vec3_a, vec3_a, mat4_a);

        mat4.fromTRS(mat4_a, vec3_a, this._light.transform.world_rotation, vec3.ONE);

        const left = -aabb_a.halfExtent[0];
        const right = aabb_a.halfExtent[0];
        const bottom = -aabb_a.halfExtent[1];
        const top = aabb_a.halfExtent[1];
        const near = 0;
        const far = aabb_a.halfExtent[2] * 2;
        mat4.ortho(mat4_b, left, right, bottom, top, near, far, device.capabilities.clipSpaceMinZ);
        this.frustum.fromOrthographic(left, right, bottom, top, near, far);
        this.frustum.transform(mat4_a);

        mat4.multiply(this._viewProj, mat4_b, mat4.invert(mat4_a, mat4_a));
    }
}