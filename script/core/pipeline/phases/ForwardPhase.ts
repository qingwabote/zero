import CommandBuffer from "../../gfx/CommandBuffer.js";
import { DescriptorSet } from "../../gfx/Pipeline.js";
import RenderCamera from "../../render/RenderCamera.js";
import VisibilityBit from "../../render/VisibilityBit.js";
import shaders from "../../shaders.js";
import RenderPhase, { PhaseBit } from "../RenderPhase.js";

export default class ForwardPhase extends RenderPhase {

    protected _phase: PhaseBit;

    constructor(phase: PhaseBit, visibility: VisibilityBit = VisibilityBit.ALL) {
        super(visibility);
        this._phase = phase;
    }

    getRequestedUniforms(): Record<string, any> {
        const global = shaders.sets.global;
        return {
            Light: global.uniforms.Light,
            Camera: global.uniforms.Camera
        } as const;
    }

    initialize(globalDescriptorSet: DescriptorSet) { }

    record(commandBuffer: CommandBuffer, camera: RenderCamera) {
        const models = zero.renderScene.models;
        const framebuffer = zero.renderScene.framebuffer;
        const renderPass = zero.renderScene.getRenderPass(camera.clearFlags, framebuffer.info.colorAttachments[0].info.samples);
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
                    const pipeline = zero.renderScene.getPipeline(pass, inputAssembler.vertexInputState, renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.draw();
                }
            }
        }
        commandBuffer.endRenderPass()
    }
}