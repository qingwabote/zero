import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import mat4 from "../math/mat4.js";
import ShaderLib from "../ShaderLib.js";
import BufferViewWritable from "./buffers/BufferViewWritable.js";
import SubModel from "./SubModel.js";
import Transform from "./Transform.js";

export default class Model {
    static readonly descriptorSetLayout = ShaderLib.createDescriptorSetLayout([ShaderLib.sets.local.uniforms.Local]);

    private _localBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.UNIFORM, ShaderLib.sets.local.uniforms.Local.length);

    readonly descriptorSet: DescriptorSet;

    get visibilityFlag(): number {
        return this._transform.visibilityFlag
    }

    constructor(protected _transform: Transform, readonly subModels: SubModel[]) {
        const ModelType = (this.constructor as typeof Model);
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ModelType.descriptorSetLayout);
        descriptorSet.bindBuffer(ShaderLib.sets.local.uniforms.Local.binding, this._localBuffer.buffer);
        this.descriptorSet = descriptorSet;
    }

    update() {
        if (this._transform.hasChanged) {
            this._localBuffer.set(this._transform.world_matrix);
            this._localBuffer.set(mat4.inverseTranspose(mat4.create(), this._transform.world_matrix), 16);
            this._localBuffer.update();
        }

        for (const subModel of this.subModels) {
            subModel.update()
        }
    }
}