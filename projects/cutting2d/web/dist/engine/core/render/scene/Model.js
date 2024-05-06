import { device } from "boot";
import { BufferUsageFlagBits } from "gfx";
import { aabb3d } from "../../math/aabb3d.js";
import { mat4 } from "../../math/mat4.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";
import { ChangeRecord } from "./ChangeRecord.js";
const mat4_a = mat4.create();
var ChangeBits;
(function (ChangeBits) {
    ChangeBits[ChangeBits["NONE"] = 0] = "NONE";
    ChangeBits[ChangeBits["BOUNDS"] = 1] = "BOUNDS";
    ChangeBits[ChangeBits["UPLOAD"] = 2] = "UPLOAD";
})(ChangeBits || (ChangeBits = {}));
export class Model extends ChangeRecord {
    get bounds() {
        if (this._bounds_invalid) {
            aabb3d.transform(this._bounds, this.mesh.bounds, this._transform.world_matrix);
            this._bounds_invalid = false;
        }
        return this._bounds;
    }
    get transform() {
        return this._transform;
    }
    set transform(value) {
        this._transform = value;
        this._localBuffer_invalid = true;
        super.hasChanged |= ChangeBits.BOUNDS;
    }
    get mesh() {
        return this._mesh;
    }
    set mesh(value) {
        this._mesh = value;
        this._bounds_invalid = true;
        super.hasChanged |= ChangeBits.BOUNDS;
    }
    get hasChanged() {
        let flags = super.hasChanged;
        if (this._mesh.hasChanged || this._transform.hasChanged) {
            flags |= ChangeBits.BOUNDS;
        }
        return flags;
    }
    set hasChanged(flag) {
        super.hasChanged |= flag;
    }
    constructor(_transform, _mesh, materials) {
        super(ChangeBits.BOUNDS);
        this._transform = _transform;
        this._mesh = _mesh;
        this.materials = materials;
        this._bounds_invalid = true;
        this._bounds = aabb3d.create();
        this._localBuffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Local.length);
        this._localBuffer_invalid = false;
        this.type = 'default';
        this.order = 0;
        const descriptorSet = device.createDescriptorSet(this.constructor.descriptorSetLayout);
        descriptorSet.bindBuffer(shaderLib.sets.local.uniforms.Local.binding, this._localBuffer.buffer);
        this.descriptorSet = descriptorSet;
    }
    update() {
        if (this._mesh.hasChanged) {
            this._bounds_invalid = true;
        }
        if (this._transform.hasChanged) {
            this._bounds_invalid = this._localBuffer_invalid = true;
        }
    }
    upload() {
        if (this._localBuffer_invalid) {
            this._localBuffer.set(this._transform.world_matrix);
            // http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ or https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html
            this._localBuffer.set(mat4.inverseTranspose(mat4_a, this._transform.world_matrix), 16);
            this._localBuffer.update();
            this._localBuffer_invalid = false;
        }
        for (const material of this.materials) {
            for (const pass of material.passes) {
                pass.update();
            }
        }
    }
}
Model.descriptorSetLayout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Local]);
Model.ChangeBits = ChangeBits;
