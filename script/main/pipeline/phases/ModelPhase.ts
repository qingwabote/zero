import VisibilityFlagBits from "../../VisibilityFlagBits.js";
import ShaderLib from "../../core/ShaderLib.js";
import CommandBuffer from "../../core/gfx/CommandBuffer.js";
import DescriptorSetLayout from "../../core/gfx/DescriptorSetLayout.js";
import Pipeline, { PassState, PipelineLayout, VertexInputState } from "../../core/gfx/Pipeline.js";
import RenderPass from "../../core/gfx/RenderPass.js";
import Phase from "../../core/pipeline/Phase.js";
import Camera from "../../core/scene/Camera.js";
import Model from "../../core/scene/Model.js";
import Pass from "../../core/scene/Pass.js";
import PassType from "../PassType.js";

const modelPipelineLayoutCache: Map<typeof Model, PipelineLayout> = new Map;

const pipelineLayoutCache: Record<string, PipelineLayout> = {};

const pipelineCache: Record<string, Pipeline> = {};

export default class ModelPhase extends Phase {
    constructor(private _passType: PassType = PassType.DEFAULT, visibility: VisibilityFlagBits = VisibilityFlagBits.ALL) {
        super(visibility);
    }

    record(commandBuffer: CommandBuffer, camera: Camera, renderPass: RenderPass): void {
        const models = zero.scene.models;
        this._drawCalls = 0;
        for (const model of models) {
            if ((camera.visibilityFlags & model.visibilityFlag) == 0) {
                continue;
            }
            commandBuffer.bindDescriptorSet(this.getModelPipelineLayout(model), ShaderLib.sets.local.index, model.descriptorSet);
            for (const subModel of model.subModels) {
                if (subModel.vertexOrIndexCount == 0) {
                    continue;
                }
                for (let i = 0; i < subModel.passes.length; i++) {
                    const pass = subModel.passes[i];
                    if (pass.type != this._passType) {
                        continue;
                    }
                    const inputAssembler = subModel.inputAssemblers[i];
                    commandBuffer.bindInputAssembler(inputAssembler);
                    const layout = this.getPipelineLayout(model, pass);
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(layout, ShaderLib.sets.material.index, pass.descriptorSet);
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

    private getModelPipelineLayout(model: Model): PipelineLayout {
        const ModelType = model.constructor as typeof Model;
        let pipelineLayout = modelPipelineLayoutCache.get(ModelType);
        if (!pipelineLayout) {
            pipelineLayout = gfx.createPipelineLayout();
            pipelineLayout.initialize([zero.flow.globalDescriptorSet.layout, ModelType.descriptorSetLayout]);
            modelPipelineLayoutCache.set(ModelType, pipelineLayout);
        }
        return pipelineLayout;
    }

    private getPipelineLayout(model: Model, pass: Pass): PipelineLayout {
        const shader = pass.state.shader;
        let pipelineLayout = pipelineLayoutCache[shader.info.hash];
        if (!pipelineLayout) {
            pipelineLayout = gfx.createPipelineLayout();
            const layouts: DescriptorSetLayout[] = [];
            layouts.push(zero.flow.globalDescriptorSet.layout);
            layouts.push(model.descriptorSet.layout);
            if (pass.descriptorSet) {
                layouts.push(pass.descriptorSet.layout);
            }
            pipelineLayout.initialize(layouts)
            pipelineLayoutCache[shader.info.hash] = pipelineLayout;
        }
        return pipelineLayout;
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