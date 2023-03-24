import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import mat4 from "../math/mat4.js";
import ShaderLib from "../ShaderLib.js";
import BufferView from "./buffers/BufferView.js";
import SubModel from "./SubModel.js";
import Transform from "./Transform.js";

export default class Model {

    private _bufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShaderLib.sets.local.uniforms.Local.length);

    get visibilityFlag(): number {
        return this._transform.visibilityFlag
    }

    constructor(private _transform: Transform, readonly subModels: SubModel[]) {
        for (const subModel of subModels) {
            subModel.descriptorSet.bindBuffer(ShaderLib.sets.local.uniforms.Local.binding, this._bufferView.buffer)
        }
    }

    update() {
        if (this._transform.hasChanged) {
            this._bufferView.set(this._transform.world_matrix);
            this._bufferView.set(mat4.inverseTranspose(mat4.create(), this._transform.world_matrix), 16);
            this._bufferView.update();
        }

        for (const subModel of this.subModels) {
            subModel.update()
        }
    }
}