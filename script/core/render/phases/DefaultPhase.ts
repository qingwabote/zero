import CommandBuffer from "../../gfx/CommandBuffer.js";
import { ClearFlagBit } from "../../gfx/Pipeline.js";
import RenderPass, { AttachmentDescription, ImageLayout, LOAD_OP } from "../../gfx/RenderPass.js";
import shaders from "../../shaders.js";
import { PassPhase } from "../Pass.js";
import RenderCamera from "../RenderCamera.js";

export default class DefaultPhase {
    private _clearFlag2renderPass: Record<number, RenderPass> = {};

    record(commandBuffer: CommandBuffer, camera: RenderCamera) {
        const models = zero.renderScene.models;
        const renderPass = this.getRenderPass(camera.clearFlags);
        commandBuffer.beginRenderPass(renderPass, camera.viewport);
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
                    if (pass.phase != PassPhase.DEFAULT) {
                        continue;
                    }
                    const inputAssembler = subModel.inputAssemblers[i];
                    commandBuffer.bindInputAssembler(inputAssembler);
                    const layout = zero.renderScene.getPipelineLayout(pass.shader);
                    commandBuffer.bindDescriptorSet(layout, shaders.builtinUniforms.local.set, model.descriptorSet);
                    commandBuffer.bindDescriptorSet(layout, shaders.builtinUniforms.material.set, pass.descriptorSet);
                    const pipeline = zero.renderScene.getPipeline(pass.shader, inputAssembler.vertexInputState, renderPass, layout);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.draw();
                }
            }
        }
        commandBuffer.endRenderPass()
    }

    private getRenderPass(clearFlags: ClearFlagBit): RenderPass {
        let renderPass = this._clearFlag2renderPass[clearFlags];
        if (!renderPass) {
            renderPass = gfx.createRenderPass();
            const colorAttachment: AttachmentDescription = {
                loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                finalLayout: ImageLayout.PRESENT_SRC
            };
            const depthStencilAttachment: AttachmentDescription = {
                loadOp: clearFlags & ClearFlagBit.DEPTH ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBit.DEPTH ? ImageLayout.UNDEFINED : ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
                finalLayout: ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
            };
            renderPass.initialize({ colorAttachments: [colorAttachment], depthStencilAttachment, hash: clearFlags.toString() });
            this._clearFlag2renderPass[clearFlags] = renderPass;
        }
        return renderPass;
    }
}