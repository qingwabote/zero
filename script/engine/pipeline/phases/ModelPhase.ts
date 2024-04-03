import { CommandBuffer, DescriptorSetLayout, RenderPass } from "gfx";
import { Zero } from "../../core/Zero.js";
import { frustum } from "../../core/math/frustum.js";
import { Context } from "../../core/render/Context.js";
import { CommandCalls } from "../../core/render/pipeline/CommandCalls.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Model } from "../../core/render/scene/Model.js";
import { shaderLib } from "../../core/shaderLib.js";

export class ModelPhase extends Phase {
    constructor(
        context: Context,
        visibility: number,
        /**The model type that indicates which models should run in this phase */
        private _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private _pass = 'default',
    ) {
        super(context, visibility);
    }

    record(commandCalls: CommandCalls, commandBuffer: CommandBuffer, renderPass: RenderPass, cameraIndex: number) {
        const scene = Zero.instance.scene;
        const camera = scene.cameras[cameraIndex];
        for (const model of scene.models) {
            if ((camera.visibilities & model.transform.visibility) == 0) {
                continue;
            }
            if (model.type != this._model) {
                continue;
            }
            if (!frustum.aabb(camera.frustum_faces, model.world_bounds)) {
                continue;
            }
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, model.descriptorSet);
            const ModelType = (model.constructor as typeof Model);
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                const subMesh = model.mesh.subMeshes[i];
                const drawInfo = subMesh.drawInfo;
                if (!drawInfo.count) {
                    continue;
                }
                const material = model.materials[i];
                for (let i = 0; i < material.passes.length; i++) {
                    const pass = material.passes[i];
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