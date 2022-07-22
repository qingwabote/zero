import gfx from "../gfx.js";
import Buffer, { BufferUsageBit } from "../gfx/Buffer.js";
import { BuiltinDescriptorSetLayouts, BuiltinUniformBlocks, DescriptorSet } from "../gfx/Pipeline.js";
import { Mat4 } from "../math/mat4.js";
import SubModel from "./SubModel.js";

export interface Transform {
    matrix: Readonly<Mat4>
}

export default class Model {
    private _descriptorSet: DescriptorSet;
    get descriptorSet(): DescriptorSet {
        return this._descriptorSet;
    }

    private _subModels: SubModel[];
    get subModels(): SubModel[] {
        return this._subModels;
    }

    private _transform: Transform;

    constructor(subModels: SubModel[], transform: Transform) {
        this._subModels = subModels;
        this._transform = transform;

        const buffers: Buffer[] = [];
        buffers[BuiltinUniformBlocks.local.blocks.Local.binding] = gfx.device.createBuffer({ usage: BufferUsageBit.UNIFORM, size: Float32Array.BYTES_PER_ELEMENT * 16, stride: 1 });
        this._descriptorSet = { layout: BuiltinDescriptorSetLayouts.local, buffers, textures: [] };
    }

    update() {
        this._descriptorSet.buffers[BuiltinUniformBlocks.local.blocks.Local.binding].update(new Float32Array(this._transform.matrix));
    }
}