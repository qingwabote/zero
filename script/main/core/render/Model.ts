import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import mat4, { Mat4 } from "../math/mat4.js";
import ShaderLib from "../ShaderLib.js";
import BufferView from "./buffers/BufferView.js";
import SubModel from "./SubModel.js";

export default class Model {

    visibilityFlag = 0;

    private _bufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShaderLib.sets.local.uniforms.Local.length);

    readonly descriptorSet: DescriptorSet;

    constructor(readonly subModels: SubModel[]) {
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ShaderLib.builtinDescriptorSetLayouts.local)
        descriptorSet.bindBuffer(ShaderLib.sets.local.uniforms.Local.binding, this._bufferView.buffer);
        this.descriptorSet = descriptorSet;
    }

    updateBuffer(matrix: Readonly<Mat4>) {
        this._bufferView.set(matrix);
        this._bufferView.set(mat4.inverseTranspose(mat4.create(), matrix), 16);
        this._bufferView.update();
    }
}