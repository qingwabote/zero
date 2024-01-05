import { device } from "boot";
import { BufferUsageFlagBits, DescriptorSet } from "gfx";
import { mat4 } from "../../math/mat4.js";
import { shaderLib } from "../../shaderLib.js";
import { SubModel } from "./SubModel.js";
import { Transform } from "./Transform.js";
import { BufferView } from "./buffers/BufferView.js";

export class Model {
    static readonly descriptorSetLayout = (function () {
        const layout = shaderLib.createDescriptorSetLayout([shaderLib.sets.local.uniforms.Local]);
        (layout as any).name = "Model descriptorSetLayout";
        return layout;
    })();

    private _localBufferInvalid = false;

    protected _transform!: Transform;
    public get transform(): Transform {
        return this._transform;
    }
    public set transform(value: Transform) {
        this._transform = value;
        this._localBufferInvalid = true;
    }

    readonly subModels: SubModel[] = [];

    readonly descriptorSet: DescriptorSet;

    get visibility(): number {
        return this._transform.visibility
    }

    order: number = 0;

    private _localBuffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, shaderLib.sets.local.uniforms.Local.length);

    constructor() {
        const ModelType = (this.constructor as typeof Model);
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
            subModel.update()
        }

        this._localBufferInvalid = false;
    }
}