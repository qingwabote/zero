import { Zero } from "../../core/Zero.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { Model } from "../../core/render/scene/Model.js";
import { shaderLib } from "../../core/shaderLib.js";
function modelCompareFn(a, b) {
    return a.order - b.order;
}
export class ModelPhase extends Phase {
    constructor(context, visibility, culling, 
    /**The model type that indicates which models should run in this phase */
    _model = 'default', 
    /**The pass type that indicates which passes should run in this phase */
    _pass = 'default') {
        super(context, visibility);
        this.culling = culling;
        this._model = _model;
        this._pass = _pass;
    }
    record(profile, commandBuffer, renderPass, cameraIndex) {
        profile.emit(Profile.Event.CULL_START);
        const models = this.culling.cull(Zero.instance.scene.models, this._model, cameraIndex);
        profile.emit(Profile.Event.CULL_END);
        models.sort(modelCompareFn);
        for (const model of models) {
            if (!(model.hasChanged & Model.ChangeBits.UPLOAD)) {
                model.upload();
            }
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, model.descriptorSet);
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                const subMesh = model.mesh.subMeshes[i];
                const drawInfo = subMesh.drawInfo;
                if (!drawInfo.count) {
                    continue;
                }
                const material = model.materials[i];
                for (const pass of material.passes) {
                    if (pass.type != this._pass) {
                        continue;
                    }
                    const layouts = [model.constructor.descriptorSetLayout];
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                        layouts.push(pass.descriptorSetLayout);
                    }
                    const pipeline = this._context.getPipeline(pass.state, subMesh.inputAssembler, renderPass, layouts);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindInputAssembler(subMesh.inputAssembler);
                    if (subMesh.inputAssembler.info.indexInput) {
                        commandBuffer.drawIndexed(drawInfo.count, drawInfo.first);
                    }
                    else {
                        commandBuffer.draw(drawInfo.count);
                    }
                    profile.draws++;
                }
            }
        }
    }
}
