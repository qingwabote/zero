import { CommandBuffer, RenderPass } from "gfx";
import { VisibilityFlagBits } from "../../VisibilityFlagBits.js";
import { Zero } from "../../core/Zero.js";
import { Context } from "../../core/render/Context.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Model } from "../../core/render/scene/Model.js";
import { shaderLib } from "../../core/shaderLib.js";

export class ModelPhase extends Phase {
    constructor(
        private _context: Context,
        /**The pass type that indicates which passes should run in this phase */
        private _pass = 'default',
        visibility: VisibilityFlagBits = VisibilityFlagBits.ALL
    ) {
        super(visibility);
    }

    record(commandBuffer: CommandBuffer, renderPass: RenderPass): number {
        const scene = Zero.instance.scene;
        const camera = scene.cameras[this._context.cameraIndex];
        let dc = 0;
        for (const model of scene.models) {
            if ((camera.visibilities & model.visibility) == 0) {
                continue;
            }
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, model.descriptorSet);
            for (const subModel of model.subModels) {
                const drawInfo = subModel.drawInfo;
                if (!drawInfo.count) {
                    continue;
                }
                const inputAssembler = subModel.inputAssembler;
                for (let i = 0; i < subModel.passes.length; i++) {
                    const pass = subModel.passes[i];
                    if (pass.type != this._pass) {
                        continue;
                    }
                    commandBuffer.bindInputAssembler(inputAssembler);
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                    }
                    const ModelType = (model.constructor as typeof Model);
                    const pipeline = this._context.getPipeline(pass, inputAssembler, renderPass, ModelType.descriptorSetLayout);
                    commandBuffer.bindPipeline(pipeline);
                    if (inputAssembler.info.indexInput) {
                        commandBuffer.drawIndexed(drawInfo.count, drawInfo.first);
                    } else {
                        commandBuffer.draw(drawInfo.count);
                    }
                    dc++;
                }
            }
        }
        return dc;
    }
}