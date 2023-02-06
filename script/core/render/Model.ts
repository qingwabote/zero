import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import mat4, { Mat4 } from "../math/mat4.js";
import ShaderLib from "../ShaderLib.js";
import BufferView from "./buffers/BufferView.js";
import SubModel from "./SubModel.js";
import VisibilityBit from "./VisibilityBit.js";

export default class Model {

    visibility: VisibilityBit = VisibilityBit.DEFAULT;

    private _descriptorSet: DescriptorSet;
    get descriptorSet(): DescriptorSet {
        return this._descriptorSet;
    }

    private _subModels: SubModel[];
    get subModels(): SubModel[] {
        return this._subModels;
    }

    private _localBuffer: BufferView;

    constructor(subModels: SubModel[]) {
        const bufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShaderLib.sets.local.uniforms.Local.length);
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ShaderLib.builtinDescriptorSetLayouts.local)
        descriptorSet.bindBuffer(ShaderLib.sets.local.uniforms.Local.binding, bufferView.buffer);
        this._descriptorSet = descriptorSet;
        this._localBuffer = bufferView;

        this._subModels = subModels;
    }

    updateBuffer(matrix: Readonly<Mat4>) {
        this._localBuffer.set(matrix);
        this._localBuffer.set(mat4.inverseTranspose(mat4.create(), matrix), 16);
        this._localBuffer.update();
    }
}