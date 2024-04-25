import { mat4 } from "../../../math/mat4.js";
import { Frustum } from "../../scene/Frustum.js";
export class Cascades {
    constructor(_camera, _count) {
        this._camera = _camera;
        this._count = _count;
        const frusta = [];
        const bounds = [];
        const viewProjs = [];
        for (let i = 0; i < _count; i++) {
            if (_count != 1) {
                frusta.push(new Frustum);
            }
            bounds.push(new Frustum);
            viewProjs.push(mat4.create());
        }
        this._frusta = frusta;
        this._bounds = bounds;
    }
}
