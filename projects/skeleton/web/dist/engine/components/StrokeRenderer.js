import { Model } from "../core/render/scene/Model.js";
import { Stroke } from "../Stroke.js";
import { BoundedRenderer } from "./BoundedRenderer.js";
export class StrokeRenderer extends BoundedRenderer {
    get bounds() {
        return this._stroke.mesh.bounds;
    }
    constructor(node) {
        super(node);
        this._stroke = new Stroke();
    }
    createModel() {
        return new Model(this.node, this._stroke.mesh, [{ passes: [this._stroke.pass] }]);
    }
    line(from, to, color) {
        this._stroke.line(from, to, color);
    }
    aabb(aabb, color) {
        this._stroke.aabb(aabb, color);
    }
    frustum(frustum, color) {
        this._stroke.frustum(frustum, color);
    }
    upload(commandBuffer) {
        this._stroke.upload(commandBuffer);
    }
    clear() {
        // this._vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        // this._vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        // aabb3d.set(this._bounds, 0, 0, 0, 0, 0, 0);
        this._stroke.clear();
    }
}
