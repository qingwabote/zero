import gfx from "../gfx.js";
import { BufferUsageBit } from "../gfx/Buffer.js";
import { BuiltinDescriptorSetLayouts, BuiltinUniformBlocks } from "../gfx/Pipeline.js";
import render from "../render.js";
const float32Array = new Float32Array(16);
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
        render.dirtyTransforms.set(transform, transform);
        const buffers = [];
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
//# sourceMappingURL=Model.js.map