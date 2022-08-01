import { BufferUsageBit } from "./gfx/Buffer.js";
import gfx from "./gfx.js";
import { BuiltinUniformBlocks, BuiltinDescriptorSetLayouts } from "./gfx/Pipeline.js";
export default class Model {
    _descriptorSet;
    get descriptorSet() {
        return this._descriptorSet;
    }
    _subModels;
    get subModels() {
        return this._subModels;
    }
    _transform;
    constructor(subModels, transform) {
        this._subModels = subModels;
        this._transform = transform;
        const buffers = [];
        buffers[BuiltinUniformBlocks.local.blocks.Local.binding] = gfx.device.createBuffer({ usage: BufferUsageBit.UNIFORM, size: Float32Array.BYTES_PER_ELEMENT * 16, stride: 1 });
        this._descriptorSet = { layout: BuiltinDescriptorSetLayouts.local, buffers, textures: [] };
    }
    update() {
        this._descriptorSet.buffers[BuiltinUniformBlocks.local.blocks.Local.binding].update(new Float32Array(this._transform.matrix));
    }
}
//# sourceMappingURL=Model.js.map