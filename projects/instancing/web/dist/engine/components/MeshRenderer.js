import { aabb3d } from "../core/math/aabb3d.js";
import { Model } from "../core/render/scene/Model.js";
import { BoundedRenderer } from "./BoundedRenderer.js";
export class MeshRenderer extends BoundedRenderer {
    constructor() {
        super(...arguments);
        this._mesh = null;
        this._materials = null;
    }
    get mesh() {
        return this._mesh;
    }
    set mesh(value) {
        this._mesh = value;
    }
    get materials() {
        return this._materials;
    }
    set materials(value) {
        this._materials = value;
    }
    get bounds() {
        var _a, _b;
        return (_b = (_a = this._mesh) === null || _a === void 0 ? void 0 : _a.bounds) !== null && _b !== void 0 ? _b : aabb3d.ZERO;
    }
    createModel() {
        if (!this._mesh || !this._materials) {
            return null;
        }
        return new Model(this.node, this._mesh, this._materials);
    }
}
