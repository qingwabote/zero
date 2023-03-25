import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import DescriptorSet from "../gfx/DescriptorSet.js";
import DescriptorSetLayout from "../gfx/DescriptorSetLayout.js";
import { PipelineLayout } from "../gfx/Pipeline.js";
import mat4 from "../math/mat4.js";
import ShaderLib from "../ShaderLib.js";
import BufferView from "./buffers/BufferView.js";
import SubModel from "./SubModel.js";
import Transform from "./Transform.js";

const descriptorSetLayout2pipelineLayout: Map<DescriptorSetLayout, PipelineLayout> = new Map;

export default class Model {

    private _localBuffer = new BufferView("Float32", BufferUsageFlagBits.UNIFORM, ShaderLib.sets.local.uniforms.Local.length);

    readonly pipelineLayout: PipelineLayout;

    readonly descriptorSet: DescriptorSet;

    get visibilityFlag(): number {
        return this._transform.visibilityFlag
    }

    constructor(private _transform: Transform, readonly subModels: SubModel[]) {
        const layout = ShaderLib.getLocalDescriptorSetLayout(ShaderLib.sets.local.uniforms.Local);

        let pipelineLayout = descriptorSetLayout2pipelineLayout.get(layout);
        if (!pipelineLayout) {
            pipelineLayout = gfx.createPipelineLayout();
            pipelineLayout.initialize([zero.flow.globalDescriptorSet.layout, layout]);
            descriptorSetLayout2pipelineLayout.set(layout, pipelineLayout);
        }
        this.pipelineLayout = pipelineLayout;

        const descriptorSet = gfx.createDescriptorSet();
        descriptorSet.initialize(layout);
        descriptorSet.bindBuffer(ShaderLib.sets.local.uniforms.Local.binding, this._localBuffer.buffer);
        this.descriptorSet = descriptorSet;
    }

    update() {
        if (this._transform.hasChanged) {
            this._localBuffer.set(this._transform.world_matrix);
            this._localBuffer.set(mat4.inverseTranspose(mat4.create(), this._transform.world_matrix), 16);
            this._localBuffer.update();
        }

        for (const subModel of this.subModels) {
            subModel.update()
        }
    }
}