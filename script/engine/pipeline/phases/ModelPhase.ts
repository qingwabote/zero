import { CommandBuffer, DescriptorSetLayout, RenderPass } from "gfx";
import { Zero } from "../../core/Zero.js";
import { CommandCalls } from "../../core/render/pipeline/CommandCalls.js";
import { Context } from "../../core/render/pipeline/Context.js";
import { Culling } from "../../core/render/pipeline/Culling.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Model } from "../../core/render/scene/Model.js";
import { shaderLib } from "../../core/shaderLib.js";

function modelCompareFn(a: Model, b: Model) {
    return a.order - b.order;
}

export class ModelPhase extends Phase {
    constructor(
        context: Context,
        visibility: number,
        private _culling: Culling,
        /**The model type that indicates which models should run in this phase */
        private _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private _pass = 'default',
    ) {
        super(context, visibility);
    }

    record(commandCalls: CommandCalls, commandBuffer: CommandBuffer, renderPass: RenderPass, cameraIndex: number) {
        const models = this._culling.cull(Zero.instance.scene.models, this._model, cameraIndex).sort(modelCompareFn);
        for (const model of models) {
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, model.descriptorSet);
            const ModelType = (model.constructor as typeof Model);
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
                    const layouts: DescriptorSetLayout[] = [ModelType.descriptorSetLayout];
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                        layouts.push(pass.descriptorSetLayout);
                    }
                    const pipeline = this._context.getPipeline(pass.state, subMesh.inputAssembler, renderPass, layouts);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindInputAssembler(subMesh.inputAssembler);
                    if (subMesh.inputAssembler.info.indexInput) {
                        commandBuffer.drawIndexed(drawInfo.count, drawInfo.first);
                    } else {
                        commandBuffer.draw(drawInfo.count);
                    }
                    commandCalls.draws++;
                }
            }
        }
    }
}