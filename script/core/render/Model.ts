import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import mat4 from "../math/mat4.js";
import ShaderLib from "../ShaderLib.js";
import BufferView from "./buffers/BufferView.js";
import { RenderNode } from "./RenderNode.js";
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

    private _localBuffer: BufferView;

    private _node: RenderNode;
    get node(): RenderNode {
        return this._node;
    }

    constructor(subModels: SubModel[], node: RenderNode) {
        zero.renderScene.dirtyObjects.set(node, node);

        const bufferView = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShaderLib.sets.local.uniforms.Local.length);
        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(ShaderLib.builtinDescriptorSetLayouts.local)
        descriptorSet.bindBuffer(ShaderLib.sets.local.uniforms.Local.binding, bufferView.buffer);
        this._descriptorSet = descriptorSet;
        this._localBuffer = bufferView;

        this._subModels = subModels;
        this._node = node;
    }

    update() {
        if (zero.renderScene.dirtyObjects.has(this._node)) {
            this._localBuffer.set(this._node.matrix);
            this._localBuffer.set(mat4.inverseTranspose(mat4.create(), this._node.matrix), 16);
            this._localBuffer.update();
        }
    }
}