import CommandBuffer from "../../gfx/CommandBuffer.js";
import PassPhase from "../../render/PassPhase.js";
import RenderCamera from "../../render/RenderCamera.js";
import VisibilityBit from "../../render/VisibilityBit.js";
import shaders from "../../shaders.js";
import PipelineUniform from "../PipelineUniform.js";
import RenderPhase from "../RenderPhase.js";
import CameraUniform from "../uniforms/CameraUniform.js";
import LightUniform from "../uniforms/LightUniform.js";

export default class ForwardPhase extends RenderPhase {

    protected _phase: PassPhase;

    constructor(phase: PassPhase = PassPhase.DEFAULT, visibility: VisibilityBit = VisibilityBit.ALL) {
        super(visibility);
        this._phase = phase;
    }

    getRequestedUniforms(): (new () => PipelineUniform)[] {
        return [LightUniform, CameraUniform];
    }

    record(commandBuffer: CommandBuffer, camera: RenderCamera) {
        const models = zero.renderScene.models;
        const framebuffer = zero.renderFlow.framebuffer;
        const renderPass = zero.renderFlow.getRenderPass(camera.clearFlags, framebuffer.info.colorAttachments[0].info.samples);
        commandBuffer.beginRenderPass(renderPass, framebuffer, camera.viewport);
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
                    commandBuffer.bindDescriptorSet(layout, shaders.sets.material.set, pass.descriptorSet);
                    const pipeline = zero.renderFlow.getPipeline(pass, inputAssembler.vertexInputState, renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.draw();
                }
            }
        }
        commandBuffer.endRenderPass()
    }
}