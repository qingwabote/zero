import { device } from "boot";
import { BufferUsageFlagBits } from "gfx";
import { mat4 } from "../../math/mat4.js";
import { shaderLib } from "../../shaderLib.js";
import { BufferView } from "../BufferView.js";
export class Model {
    get transform() {
        return this._transform;
    }
    set transform(value) {
        this._transform = value;
        this._localBufferInvalid = true;
    }
    get visibility() {
        return this._transform.visibility;
    }
    constructor() {
        this._localBufferInvalid = false;
        this.subModels = [];
        this.type = 'default';
        this.order = 0;
        this._localBuffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Local.length);
        const ModelType = this.constructor;
        const descriptorSet = device.createDescriptorSet(ModelType.descriptorSetLayout);
        descriptorSet.bindBuffer(shaderLib.sets.local.uniforms.Local.binding, this._localBuffer.buffer);
        this.descriptorSet = descriptorSet;
    }
    onAddToScene() {
        this._localBufferInvalid = true;
    }
    update() {
        if (this._transform.hasChanged || this._localBufferInvalid) {
            this._localBuffer.set(this._transform.world_matrix);
            this._localBuffer.set(mat4.inverseTranspose(mat4.create(), this._transform.world_matrix), 16);
            this._localBuffer.update();
        }
        for (const subModel of this.subModels) {
            subModel.update();
        }
        this._localBufferInvalid = false;
    }
}
Model.descriptorSetLayout = (function () {
    const layout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Local]);
    layout.name = "Model descriptorSetLayout";
    return layout;
})();
