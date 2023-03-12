import CommandBuffer from "../../core/gfx/CommandBuffer.js";
import { VertexInputState } from "../../core/gfx/InputAssembler.js";
import Pipeline, { PassState, PipelineLayout } from "../../core/gfx/Pipeline.js";
import RenderPass from "../../core/gfx/RenderPass.js";
import Shader from "../../core/gfx/Shader.js";
import Phase from "../../core/render/Phase.js";
import Camera from "../../core/scene/Camera.js";
import ShaderLib from "../../core/ShaderLib.js";
import VisibilityBit from "../../VisibilityBit.js";
import PhaseFlag from "../PhaseFlag.js";

const pipelineLayoutCache: Record<string, PipelineLayout> = {};

const pipelineCache: Record<string, Pipeline> = {};

export default class ModelPhase extends Phase {
    private _flag: PhaseFlag;

    constructor(flag: PhaseFlag = PhaseFlag.DEFAULT, visibility: VisibilityBit = VisibilityBit.ALL) {
        super(visibility);
        this._flag = flag;
    }

    record(commandBuffer: CommandBuffer, camera: Camera, renderPass: RenderPass): void {
        const models = zero.scene.models;
        this._drawCalls = 0;
        for (const model of models) {
            if ((camera.visibilityFlags & model.visibilityFlag) == 0) {
                continue;
            }
            for (const subModel of model.subModels) {
                if (subModel.vertexOrIndexCount == 0) {
                    continue;
                }
                for (let i = 0; i < subModel.passes.length; i++) {
                    const pass = subModel.passes[i];
                    if (pass.flag != this._flag) {
                        continue;
                    }
                    const inputAssembler = subModel.inputAssemblers[i];
                    commandBuffer.bindInputAssembler(inputAssembler);
                    const layout = this.getPipelineLayout(pass.state.shader);
                    commandBuffer.bindDescriptorSet(layout, ShaderLib.sets.local.set, model.descriptorSet);
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(layout, ShaderLib.sets.material.set, pass.descriptorSet);
                    }
                    const pipeline = this.getPipeline(pass.state, inputAssembler.info.vertexInputState, renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    if (inputAssembler.info.indexInput) {
                        commandBuffer.drawIndexed(subModel.vertexOrIndexCount);
                    } else {
                        commandBuffer.draw(subModel.vertexOrIndexCount);
                    }
                    this._drawCalls++;
                }
            }
        }
    }

    private getPipelineLayout(shader: Shader): PipelineLayout {
        let layout = pipelineLayoutCache[shader.info.hash];
        if (!layout) {
            layout = gfx.createPipelineLayout();
            layout.initialize([
                zero.flow.globalDescriptorSet.layout,
                ShaderLib.builtinDescriptorSetLayouts.local,
                ShaderLib.instance.getDescriptorSetLayout(shader)
            ])
            pipelineLayoutCache[shader.info.hash] = layout;
        }
        return layout;
    }

    /**
     * @param renderPass a compatible renderPass
     */
    private getPipeline(passState: PassState, vertexInputState: VertexInputState, renderPass: RenderPass, layout: PipelineLayout): Pipeline {
        const pipelineHash = passState.hash + vertexInputState.hash + renderPass.info.compatibleHash;
        let pipeline = pipelineCache[pipelineHash];
        if (!pipeline) {
            pipeline = gfx.createPipeline();
            pipeline.initialize({ passState, vertexInputState, renderPass, layout, });
            pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }
}