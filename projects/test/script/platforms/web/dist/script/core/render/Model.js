import { BufferUsageFlagBits, MemoryUsage } from "../gfx/Buffer.js";
import mat4 from "../math/mat4.js";
import shaders from "../shaders.js";
const float32Array = new Float32Array(shaders.builtinUniformBlocks.local.blocks.Local.size / Float32Array.BYTES_PER_ELEMENT);
export default class Model {
    _descriptorSet;
    get descriptorSet() {
        return this._descriptorSet;
    }
    _subModels;
    get subModels() {
        return this._subModels;
    }
    _localBuffer;
    _node;
    get node() {
        return this._node;
    }
    constructor(subModels, node) {
        zero.dirtyTransforms.set(node, node);
        this._localBuffer = gfx.createBuffer();
        this._localBuffer.initialize({ usage: BufferUsageFlagBits.UNIFORM, mem_usage: MemoryUsage.CPU_TO_GPU, size: float32Array.byteLength });
        const descriptorSet = gfx.createDescriptorSet();
        if (descriptorSet.initialize(shaders.builtinDescriptorSetLayouts.local)) {
            throw new Error("descriptorSet initialize failed");
        }
        descriptorSet.bindBuffer(shaders.builtinUniformBlocks.local.blocks.Local.binding, this._localBuffer);
        this._descriptorSet = descriptorSet;
        this._subModels = subModels;
        this._node = node;
    }
    update() {
        if (zero.dirtyTransforms.has(this._node)) {
            this._node.updateMatrix();
            float32Array.set(this._node.matrix);
            float32Array.set(mat4.inverseTranspose(mat4.create(), this._node.matrix), 16);
            this._localBuffer.update(float32Array);
        }
    }
}
//# sourceMappingURL=Model.js.map