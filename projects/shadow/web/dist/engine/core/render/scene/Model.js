import { device } from "boot";
import { BufferUsageFlagBits } from "gfx";
import { aabb3d } from "../../math/aabb3d.js";
import { mat4 } from "../../math/mat4.js";
import { vec3 } from "../../math/vec3.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";
import { Mesh } from "./Mesh.js";
const NULL_MATERIALS = Object.freeze([]);
const vec3_a = vec3.create();
const vec3_b = vec3.create();
export class Model {
    get transform() {
        return this._transform;
    }
    set transform(value) {
        this._transform = value;
        this._localBuffer_invalid = true;
    }
    get world_bounds() {
        if (this._world_bounds_invalid) {
            aabb3d.transform(this._world_bounds, this.mesh.bounds, this._transform.world_matrix);
            this._world_bounds_invalid = false;
        }
        return this._world_bounds;
    }
    get mesh() {
        return this._mesh;
    }
    set mesh(value) {
        this._mesh = value;
        this._world_bounds_invalid = true;
    }
    constructor() {
        this._localBuffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Local.length);
        this._localBuffer_invalid = false;
        this._world_bounds_invalid = false;
        this._world_bounds = aabb3d.create();
        this._mesh = Mesh.NULL;
        this.materials = NULL_MATERIALS;
        this.type = 'default';
        this.order = 0;
        const ModelType = this.constructor;
        const descriptorSet = device.createDescriptorSet(ModelType.descriptorSetLayout);
        descriptorSet.bindBuffer(shaderLib.sets.local.uniforms.Local.binding, this._localBuffer.buffer);
        this.descriptorSet = descriptorSet;
    }
    onAddToScene() {
        this._localBuffer_invalid = true;
    }
    update() {
        if (this._mesh.hasChanged) {
            this._world_bounds_invalid = true;
        }
        if (this._transform.hasChanged) {
            this._world_bounds_invalid = this._localBuffer_invalid = true;
        }
        if (this._localBuffer_invalid) {
            this._localBuffer.set(this._transform.world_matrix);
            this._localBuffer.set(mat4.inverseTranspose(mat4.create(), this._transform.world_matrix), 16);
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
Model.descriptorSetLayout = (function () {
    const layout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Local]);
    layout.name = "Model descriptorSetLayout";
    return layout;
})();
