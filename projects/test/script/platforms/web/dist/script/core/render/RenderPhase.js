import { ClearFlagBit } from "../gfx/Pipeline.js";
import { ImageLayout, LOAD_OP } from "../gfx/RenderPass.js";
import shaders from "../shaders.js";
export var PhaseBit;
(function (PhaseBit) {
    PhaseBit[PhaseBit["DEFAULT"] = 2] = "DEFAULT";
    PhaseBit[PhaseBit["SHADOWMAP"] = 4] = "SHADOWMAP";
})(PhaseBit || (PhaseBit = {}));
export default class RenderPhase {
    _clearFlag2renderPass = {};
    _phase;
    get phase() {
        return this._phase;
    }
    constructor(phase) {
        this._phase = phase;
    }
    record(commandBuffer, camera) {
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
        commandBuffer.endRenderPass();
    }
    getRenderPass(clearFlags) {
        let renderPass = this._clearFlag2renderPass[clearFlags];
        if (!renderPass) {
            renderPass = gfx.createRenderPass();
            const colorAttachment = {
                loadOp: clearFlags & ClearFlagBit.COLOR ? LOAD_OP.CLEAR : LOAD_OP.LOAD,
                initialLayout: clearFlags & ClearFlagBit.COLOR ? ImageLayout.UNDEFINED : ImageLayout.PRESENT_SRC,
                finalLayout: ImageLayout.PRESENT_SRC
            };
            const depthStencilAttachment = {
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
//# sourceMappingURL=RenderPhase.js.map