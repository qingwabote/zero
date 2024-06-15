import { device } from "boot";
import { Zero } from "../../../Zero.js";
import { aabb3d } from "../../../math/aabb3d.js";
import { frustum } from "../../../math/frustum.js";
import { Mat4, mat4 } from "../../../math/mat4.js";
import { vec3 } from "../../../math/vec3.js";
import { Camera } from "../../scene/Camera.js";
import { Frustum } from "../../scene/Frustum.js";
import { PeriodicFlag } from "../../scene/PeriodicFlag.js";

const frustum_a = frustum.vertices();
const aabb_a = aabb3d.create();
const vec3_a = vec3.create();
const mat4_a = mat4.create();
const mat4_b = mat4.create();

export class Cascades {

    private _hasChanged = new PeriodicFlag(1);
    get hasChanged(): number {
        return this._hasChanged.value || this._camera.hasChanged.value || this._camera.transform.hasChanged.value || Zero.instance.scene.directionalLight!.hasChanged;
    }

    private _frusta: Frustum[];
    public get frusta(): readonly Readonly<Frustum>[] {
        return this._frusta;
    }

    private _bounds: Frustum[];
    public get bounds(): readonly Readonly<Frustum>[] {
        return this._bounds;
    }

    private _viewProjs: Mat4[];
    public get viewProjs(): readonly Readonly<Mat4>[] {
        return this._viewProjs;
    }

    constructor(private readonly _camera: Camera, private readonly _num: number) {
        const frusta: Frustum[] = [];
        const bounds: Frustum[] = [];
        const viewProjs: Mat4[] = [];
        for (let i = 0; i < _num; i++) {
            if (_num == 1) {
                frusta.push(_camera.frustum as Frustum);
            } else {
                frusta.push(new Frustum);
            }
            bounds.push(new Frustum);
            viewProjs.push(mat4.create());
        }
        this._frusta = frusta;
        this._bounds = bounds;
        this._viewProjs = viewProjs;
    }

    update(dumping: boolean) {
        if (!dumping && !this.hasChanged) {
            return;
        }

        let center_z_max: number;
        let halfExtent_z_max: number;

        for (let i = this._num - 1; i > -1; i--) {
            if (this._num != 1) {
                if (dumping || this._camera.hasChanged) {
                    const d = this._camera.far - this._camera.near;
                    this._frusta[i].perspective(Math.PI / 180 * this._camera.fov, this._camera.aspect, this._camera.near + d * (i / this._num), this._camera.near + d * ((i + 1) / this._num));
                }
                if (dumping || this._camera.hasChanged || this._camera.transform.hasChanged) {
                    this._frusta[i].transform(this._camera.transform.world_matrix);
                }
            }

            const light = Zero.instance.scene.directionalLight!;

            frustum.transform(frustum_a, this._frusta[i].vertices, light.view);

            aabb3d.fromPoints(aabb_a, frustum_a);
            if (i == this._num - 1) {
                center_z_max = aabb_a.center[2];
                halfExtent_z_max = aabb_a.halfExtent[2];
            } else {
                aabb_a.halfExtent[2] = Math.abs(aabb_a.center[2] - center_z_max!) + halfExtent_z_max!;
            }

            vec3.set(vec3_a, aabb_a.center[0], aabb_a.center[1], aabb_a.center[2] + aabb_a.halfExtent[2])

            vec3.transformMat4(vec3_a, vec3_a, light.model);

            mat4.translate(mat4_a, light.model, vec3_a);

            const left = -aabb_a.halfExtent[0];
            const right = aabb_a.halfExtent[0];
            const bottom = -aabb_a.halfExtent[1];
            const top = aabb_a.halfExtent[1];
            const near = 0;
            const far = aabb_a.halfExtent[2] * 2;
            mat4.orthographic(mat4_b, left, right, bottom, top, near, far, device.capabilities.clipSpaceMinZ);
            this._bounds[i].orthographic(left, right, bottom, top, near, far);
            this._bounds[i].transform(mat4_a);

            mat4.multiply(this._viewProjs[i], mat4_b, mat4.invert(mat4_a, mat4_a));
        }
    }
}