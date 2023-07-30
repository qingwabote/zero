import { BufferUsageFlagBits, DescriptorSet } from "gfx-main";
import { device } from "../impl.js";
import { mat4 } from "../math/mat4.js";
import { shaderLib } from "../shaderLib.js";
import { SubModel } from "./SubModel.js";
import { Transform } from "./Transform.js";
import { BufferViewWritable } from "./buffers/BufferViewWritable.js";

export class Model {
    static readonly descriptorSetLayout = (function () {
        const layout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Local]);
        (layout as any).name = "Model descriptorSetLayout";
        return layout;
    })();

    readonly descriptorSet: DescriptorSet;

    get visibilityFlag(): number {
        return this._transform.visibilityFlag
    }

    order: number = 0;

    private _localBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Local.length);

    private _addingToScene = false;

    constructor(protected _transform: Transform, readonly subModels: SubModel[]) {
        const ModelType = (this.constructor as typeof Model);
        const descriptorSet = device.createDescriptorSet();
        descriptorSet.initialize(ModelType.descriptorSetLayout);
        descriptorSet.bindBuffer(shaderLib.sets.local.uniforms.Local.binding, this._localBuffer.buffer);
        this.descriptorSet = descriptorSet;
    }

    onAddToScene() {
        this._addingToScene = true;
    }

    update() {
        if (this._transform.hasChanged || this._addingToScene) {
            this._localBuffer.set(this._transform.world_matrix);
            this._localBuffer.set(mat4.inverseTranspose(mat4.create(), this._transform.world_matrix), 16);
            this._localBuffer.update();
        }

        for (const subModel of this.subModels) {
            subModel.update()
        }

        this._addingToScene = false;
    }
}