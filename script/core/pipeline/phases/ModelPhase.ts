import CommandBuffer from "../../gfx/CommandBuffer.js";
import RenderPass from "../../gfx/RenderPass.js";
import PassPhase from "../../render/PassPhase.js";
import RenderCamera from "../../render/RenderCamera.js";
import VisibilityBit from "../../render/VisibilityBit.js";
import shaders from "../../shaders.js";
import RenderPhase from "../RenderPhase.js";

export default class ModelPhase extends RenderPhase {
    private _phase: PassPhase;

    constructor(phase: PassPhase = PassPhase.DEFAULT, visibility: VisibilityBit = VisibilityBit.ALL) {
        super(visibility);
        this._phase = phase;
    }

    record(commandBuffer: CommandBuffer, camera: RenderCamera, renderPass: RenderPass): void {
        const models = zero.renderScene.models;
        this._drawCalls = 0;
        for (const model of models) {
            if ((camera.visibilities & model.node.visibility) == 0) {
                continue;
            }
            for (const subModel of model.subModels) {
                if (subModel.inputAssemblers.length == 0) {
                    continue;
                }
                for (let i = 0; i < subModel.passes.length; i++) {
                    const pass = subModel.passes[i];
                    if (pass.phase != this._phase) {
                        continue;
                    }
                    const inputAssembler = subModel.inputAssemblers[i];
                    commandBuffer.bindInputAssembler(inputAssembler);
                    const layout = zero.renderFlow.getPipelineLayout(pass.shader);
                    commandBuffer.bindDescriptorSet(layout, shaders.sets.local.set, model.descriptorSet);
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(layout, shaders.sets.material.set, pass.descriptorSet);
                    }
                    const pipeline = zero.renderFlow.getPipeline(pass, inputAssembler.info.vertexInputState, renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.drawIndexed(inputAssembler.info.count);
                    this._drawCalls++;
                }
            }
        }
    }
}