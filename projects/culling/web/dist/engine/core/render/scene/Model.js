import { device } from "boot";
import { BufferUsageFlagBits } from "gfx";
import { aabb3d } from "../../math/aabb3d.js";
import { mat4 } from "../../math/mat4.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";
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
    constructor(_transform, _mesh, materials) {
        this._transform = _transform;
        this._mesh = _mesh;
        this.materials = materials;
        this._localBuffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Local.length);
        this._localBuffer_invalid = false;
        this._world_bounds_invalid = false;
        this._world_bounds = aabb3d.create();
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
            // http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ or https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html
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
Model.descriptorSetLayout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Local]);
