import CommandBuffer from "../gfx/CommandBuffer.js";
import shaders from "../shaders.js";
import RenderCamera from "./RenderCamera.js";

export enum PhaseBit {
    DEFAULT = 1 << 1,
    SHADOWMAP = 1 << 2,
}

export default class RenderPhase {

    protected _phase: PhaseBit;
    get phase(): PhaseBit {
        return this._phase;
    }

    constructor(phase: PhaseBit) {
        this._phase = phase;
    }

    record(commandBuffer: CommandBuffer, camera: RenderCamera) {
        const models = zero.renderScene.models;
        const renderPass = zero.renderScene.getRenderPass(camera.clearFlags);
        commandBuffer.beginRenderPass(renderPass, zero.renderScene.framebuffer, camera.viewport);
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
                    const layout = zero.renderScene.getPipelineLayout(pass.shader);
                    commandBuffer.bindDescriptorSet(layout, shaders.builtinUniforms.local.set, model.descriptorSet);
                    commandBuffer.bindDescriptorSet(layout, shaders.builtinUniforms.material.set, pass.descriptorSet);
                    const pipeline = zero.renderScene.getPipeline(pass, inputAssembler.vertexInputState, renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.draw();
                }
            }
        }
        commandBuffer.endRenderPass()
    }
}