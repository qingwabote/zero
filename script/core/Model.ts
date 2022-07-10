import { mat4, vec3 } from "gl-matrix";
import Buffer, { BufferUsageBit } from "./gfx/Buffer.js";
import gfx, { Transform } from "./gfx.js";
import { DescriptorSet, BuiltinUniformBlocks, BuiltinDescriptorSetLayouts } from "./gfx/Pipeline.js";
import SubModel from "./SubModel.js";

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
        const matWorld = mat4.create();
        mat4.translate(matWorld, matWorld, vec3.fromValues(this._transform.x, this._transform.y, this._transform.z))
        mat4.rotateX(matWorld, matWorld, Math.PI / 180 * this._transform.eulerX);
        mat4.rotateY(matWorld, matWorld, Math.PI / 180 * this._transform.eulerY);
        mat4.rotateZ(matWorld, matWorld, Math.PI / 180 * this._transform.eulerZ);
        this._descriptorSet.buffers[BuiltinUniformBlocks.local.blocks.Local.binding].update(matWorld as Float32Array);
    }
}