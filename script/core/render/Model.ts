import gfx from "../gfx.js";
import Buffer, { BufferUsageBit } from "../gfx/Buffer.js";
import { DescriptorSet } from "../gfx/Pipeline.js";
import render, { TransformSource } from "../render.js";
import { BuiltinDescriptorSetLayouts, BuiltinUniformBlocks } from "../shaders.js";
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

    private _transform: TransformSource;

    constructor(subModels: SubModel[], transform: TransformSource) {
        render.dirtyTransforms.set(transform, transform);

        const buffers: Buffer[] = [];
        buffers[BuiltinUniformBlocks.local.blocks.Local.binding] = gfx.device.createBuffer({ usage: BufferUsageBit.UNIFORM, size: float32Array.byteLength, stride: 1 });
        this._descriptorSet = { layout: BuiltinDescriptorSetLayouts.local, buffers, textures: [] };

        this._subModels = subModels;
        this._transform = transform;
    }

    update() {
        if (render.dirtyTransforms.has(this._transform)) {
            this._transform.updateMatrix();
            float32Array.set(this._transform.matrix);
            this._descriptorSet.buffers[BuiltinUniformBlocks.local.blocks.Local.binding].update(float32Array);
        }
    }
}