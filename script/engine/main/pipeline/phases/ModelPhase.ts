import { CommandBuffer, PassState, Pipeline, PipelineLayout, RenderPass, VertexInputState, impl } from "gfx-main";
import { VisibilityFlagBits } from "../../VisibilityFlagBits.js";
import { Zero } from "../../core/Zero.js";
import { device } from "../../core/impl.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Camera } from "../../core/render/scene/Camera.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { Root } from "../../core/render/scene/Root.js";
import { shaderLib } from "../../core/shaderLib.js";
import { hashLib } from "./internal/hashLib.js";

const modelPipelineLayoutCache: Map<typeof Model, PipelineLayout> = new Map;
const pipelineLayoutCache: Record<number, PipelineLayout> = {};
const pipelineCache: Record<number, Pipeline> = {};

export class ModelPhase extends Phase {
    constructor(private _passType = 'default', visibility: VisibilityFlagBits = VisibilityFlagBits.ALL) {
        super(visibility);
    }

    record(commandBuffer: CommandBuffer, scene: Root, camera: Camera, renderPass: RenderPass): void {
        this._drawCalls = 0;
        for (const model of scene.models) {
            if ((camera.visibilityFlags & model.visibilityFlag) == 0) {
                continue;
            }
            commandBuffer.bindDescriptorSet(this.getModelPipelineLayout(model), shaderLib.sets.local.index, model.descriptorSet);
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
                        commandBuffer.bindDescriptorSet(layout, shaderLib.sets.material.index, pass.descriptorSet);
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
            const info = new impl.PipelineLayoutInfo;
            info.layouts.add(Zero.instance.flow.globalDescriptorSet.layout);
            info.layouts.add(ModelType.descriptorSetLayout);
            pipelineLayout = device.createPipelineLayout();
            pipelineLayout.initialize(info);
            modelPipelineLayoutCache.set(ModelType, pipelineLayout);
        }
        return pipelineLayout;
    }

    private getPipelineLayout(model: Model, pass: Pass): PipelineLayout {
        const shader = pass.state.shader;
        const shader_hash = hashLib.shader(shader);
        let pipelineLayout = pipelineLayoutCache[shader_hash];
        if (!pipelineLayout) {
            const info = new impl.PipelineLayoutInfo;
            info.layouts.add(Zero.instance.flow.globalDescriptorSet.layout);
            info.layouts.add(model.descriptorSet.layout);
            if (pass.descriptorSet) {
                info.layouts.add(pass.descriptorSet.layout);
            }
            pipelineLayout = device.createPipelineLayout();
            pipelineLayout.initialize(info)
            pipelineLayoutCache[shader_hash] = pipelineLayout;
        }
        return pipelineLayout;
    }

    /**
     * @param renderPass a compatible renderPass
     */
    private getPipeline(pass: PassState, vertexInputState: VertexInputState, renderPass: RenderPass, layout: PipelineLayout): Pipeline {
        const pipelineHash = hashLib.passState(pass) ^ hashLib.vertexInputState(vertexInputState) ^ hashLib.renderPass(renderPass);
        let pipeline = pipelineCache[pipelineHash];
        if (!pipeline) {
            const info = new impl.PipelineInfo();
            info.passState = pass;
            info.vertexInputState = vertexInputState;
            info.renderPass = renderPass;
            info.layout = layout;
            pipeline = device.createPipeline();
            pipeline.initialize(info);
            pipelineCache[pipelineHash] = pipeline;
        }
        return pipeline;
    }
}