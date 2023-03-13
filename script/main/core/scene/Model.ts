import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import mat4 from "../math/mat4.js";
import ShaderLib from "../ShaderLib.js";
import BufferView from "./buffers/BufferView.js";
import FrameDirtyRecord from "./FrameDirtyRecord.js";
import SubModel from "./SubModel.js";
import Transform from "./Transform.js";

export default class Model extends FrameDirtyRecord {

    private _bufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShaderLib.sets.local.uniforms.Local.length);

    readonly descriptorSet: DescriptorSet;

    constructor(readonly transform: Transform, readonly subModels: SubModel[]) {
        super();
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ShaderLib.builtinDescriptorSetLayouts.local)
        descriptorSet.bindBuffer(ShaderLib.sets.local.uniforms.Local.binding, this._bufferView.buffer);
        this.descriptorSet = descriptorSet;
    }

    update() {
        if (this.transform.hasChanged) {
            this._bufferView.set(this.transform.world_matrix);
            this._bufferView.set(mat4.inverseTranspose(mat4.create(), this.transform.world_matrix), 16);
            this._bufferView.update();
        }

        for (const subModel of this.subModels) {
            for (const pass of subModel.passes) {
                pass.update();
            }
        }
    }
}