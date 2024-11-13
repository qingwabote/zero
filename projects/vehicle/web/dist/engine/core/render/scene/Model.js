import { Format } from "gfx";
import { aabb3d } from "../../math/aabb3d.js";
import { shaderLib } from "../../shaderLib.js";
import { Periodic } from "./Periodic.js";
const a_model = { location: shaderLib.attributes.model.location, format: Format.RGBA32_SFLOAT, multiple: 4 };
var ChangeBits;
(function (ChangeBits) {
    ChangeBits[ChangeBits["NONE"] = 0] = "NONE";
    ChangeBits[ChangeBits["BOUNDS"] = 1] = "BOUNDS";
})(ChangeBits || (ChangeBits = {}));
export class Model {
    get descriptorSet() {
        return undefined;
    }
    get bounds() {
        return this._bounds;
    }
    get hasChanged() {
        let flag = this._hasOwnChanged.value;
        if (this._mesh.hasChanged || this._transform.hasChangedFlag.value) {
            flag |= ChangeBits.BOUNDS;
        }
        return flag;
    }
    get transform() {
        return this._transform;
    }
    get mesh() {
        return this._mesh;
    }
    set mesh(value) {
        this._mesh = value;
        this._hasOwnChanged.value |= ChangeBits.BOUNDS;
    }
    constructor(_transform, _mesh, materials) {
        this._transform = _transform;
        this._mesh = _mesh;
        this.materials = materials;
        this._bounds = aabb3d.create();
        this._hasOwnChanged = new Periodic(ChangeBits.BOUNDS, ChangeBits.NONE);
        this.type = 'default';
        /**
         * Draw order
         */
        this.order = 0;
    }
    updateBounds() {
        aabb3d.transform(this._bounds, this._mesh.bounds, this._transform.world_matrix);
    }
    upload(attributes) {
        attributes[a_model.location].add(this._transform.world_matrix);
    }
}
Model.a_model = a_model;
Model.attributes = [a_model];
Model.ChangeBits = ChangeBits;
