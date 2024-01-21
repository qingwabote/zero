import { VisibilityFlagBits } from "../../VisibilityFlagBits.js";
import { Zero } from "../../core/Zero.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { shaderLib } from "../../core/shaderLib.js";
export class ModelPhase extends Phase {
    constructor(context, visibility = VisibilityFlagBits.ALL, 
    /**The model type that indicates which models should run in this phase */
    _model = 'default', 
    /**The pass type that indicates which passes should run in this phase */
    _pass = 'default') {
        super(context, visibility);
        this._model = _model;
        this._pass = _pass;
    }
    record(commandBuffer, renderPass) {
        const scene = Zero.instance.scene;
        const camera = scene.cameras[this._context.cameraIndex];
        let dc = 0;
        for (const model of scene.models) {
            if ((camera.visibilities & model.visibility) == 0) {
                continue;
            }
            if (model.type != this._model) {
                continue;
            }
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, model.descriptorSet);
            const ModelType = model.constructor;
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
                    const layouts = [ModelType.descriptorSetLayout];
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                        layouts.push(pass.descriptorSetLayout);
                    }
                    const pipeline = this._context.getPipeline(pass.state, inputAssembler, renderPass, layouts);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindInputAssembler(inputAssembler);
                    if (inputAssembler.info.indexInput) {
                        commandBuffer.drawIndexed(drawInfo.count, drawInfo.first);
                    }
                    else {
                        commandBuffer.draw(drawInfo.count);
                    }
                    dc++;
                }
            }
        }
        return dc;
    }
}
