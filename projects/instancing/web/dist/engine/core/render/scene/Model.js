import { device } from "boot";
import { aabb3d } from "../../math/aabb3d.js";
import { shaderLib } from "../../shaderLib.js";
import { PeriodicFlag } from "./PeriodicFlag.js";
var ChangeBits;
(function (ChangeBits) {
    ChangeBits[ChangeBits["NONE"] = 0] = "NONE";
    ChangeBits[ChangeBits["BOUNDS"] = 1] = "BOUNDS";
})(ChangeBits || (ChangeBits = {}));
export class Model {
    get bounds() {
        if (this._bounds_invalidated) {
            aabb3d.transform(this._bounds, this.mesh.bounds, this._transform.world_matrix);
            this._bounds_invalidated = false;
        }
        return this._bounds;
    }
    get hasChanged() {
        let flag = this._hasChanged.value;
        if (this._mesh.hasChanged || this._transform.hasChanged) {
            flag |= ChangeBits.BOUNDS;
        }
        return flag;
    }
    get transform() {
        return this._transform;
    }
    set transform(value) {
        this._transform = value;
        this._hasChanged.addBit(ChangeBits.BOUNDS);
    }
    get mesh() {
        return this._mesh;
    }
    set mesh(value) {
        this._mesh = value;
        this._bounds_invalidated = true;
        this._hasChanged.addBit(ChangeBits.BOUNDS);
    }
    get descriptorSetLayout() {
        return this.constructor.descriptorSetLayout;
    }
    constructor(_transform, _mesh, materials) {
        this._transform = _transform;
        this._mesh = _mesh;
        this.materials = materials;
        this._bounds_invalidated = true;
        this._bounds = aabb3d.create();
        this._hasChanged = new PeriodicFlag(ChangeBits.BOUNDS);
        this.type = 'default';
        this.order = 0;
        this._hasUploaded = new PeriodicFlag;
        const descriptorSetLayout = this.constructor.descriptorSetLayout;
        if (descriptorSetLayout.info.bindings.size()) {
            this.descriptorSet = device.createDescriptorSet(descriptorSetLayout);
        }
    }
    update() {
        if (this._mesh.hasChanged || this._transform.hasChanged) {
            this._bounds_invalidated = true;
        }
    }
    upload() {
        this._hasUploaded.reset(1);
    }
}
Model.descriptorSetLayout = shaderLib.createDescriptorSetLayout([]);
Model.ChangeBits = ChangeBits;
