import Buffer, { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { DescriptorSet } from "../gfx/Pipeline.js";
import render, { TransformSource } from "../render.js";
import shaders, { BuiltinUniformBlocks } from "../shaders.js";
import SubModel from "./SubModel.js";

const float32Array = new Float32Array(16);

export default class Model {
    private _descriptorSet: DescriptorSet;
    get descriptorSet(): DescriptorSet {
        return this._descriptorSet;
    }

    private _subModels: SubModel[];
    get subModels(): SubModel[] {
        return this._subModels;
    }

    private _localBuffer: Buffer;

    private _transform: TransformSource;

    constructor(subModels: SubModel[], transform: TransformSource) {
        render.dirtyTransforms.set(transform, transform);

        this._localBuffer = zero.gfx.createBuffer();
        this._localBuffer.initialize({ usage: BufferUsageFlagBits.UNIFORM, size: float32Array.byteLength });

        const descriptorSet = zero.gfx.createDescriptorSet();
        if (descriptorSet.initialize(shaders.builtinDescriptorSetLayouts.local)) {
            throw new Error("descriptorSet initialize failed");
        }
        descriptorSet.bindBuffer(BuiltinUniformBlocks.local.blocks.Local.binding, this._localBuffer);
        this._descriptorSet = descriptorSet;

        this._subModels = subModels;
        this._transform = transform;
    }

    update() {
        if (render.dirtyTransforms.has(this._transform)) {
            this._transform.updateMatrix();
            float32Array.set(this._transform.matrix);
            this._localBuffer.update(float32Array);
        }
    }
}