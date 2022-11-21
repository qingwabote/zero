import Buffer, { BufferUsageFlagBits, MemoryUsage } from "../gfx/Buffer.js";
import { DescriptorSet } from "../gfx/Pipeline.js";
import mat4 from "../math/mat4.js";
import shaders from "../shaders.js";
import { RenderNode } from "./RenderNode.js";
import SubModel from "./SubModel.js";

const float32Array = new Float32Array(shaders.builtinUniforms.local.blocks.Local.size / Float32Array.BYTES_PER_ELEMENT);

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

    private _node: RenderNode;
    get node(): RenderNode {
        return this._node;
    }

    constructor(subModels: SubModel[], node: RenderNode) {
        zero.renderScene.dirtyObjects.set(node, node);

        this._localBuffer = gfx.createBuffer();
        this._localBuffer.initialize({ usage: BufferUsageFlagBits.UNIFORM, mem_usage: MemoryUsage.CPU_TO_GPU, size: float32Array.byteLength });

        const descriptorSet = gfx.createDescriptorSet();
        if (descriptorSet.initialize(shaders.builtinDescriptorSetLayouts.local)) {
            throw new Error("descriptorSet initialize failed");
        }
        descriptorSet.bindBuffer(shaders.builtinUniforms.local.blocks.Local.binding, this._localBuffer);
        this._descriptorSet = descriptorSet;

        this._subModels = subModels;
        this._node = node;
    }

    update() {
        if (zero.renderScene.dirtyObjects.has(this._node)) {
            this._node.updateTransform();
            float32Array.set(this._node.matrix);
            float32Array.set(mat4.inverseTranspose(mat4.create(), this._node.matrix), 16);
            this._localBuffer.update(float32Array);
        }
    }
}