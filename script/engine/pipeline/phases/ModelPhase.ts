import { CommandBuffer, RenderPass } from "gfx";
import { Zero } from "../../core/Zero.js";
import { Context } from "../../core/render/pipeline/Context.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { Material } from "../../core/render/scene/Material.js";
import { Model } from "../../core/render/scene/Model.js";
import { SubMesh } from "../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../core/shaderLib.js";
import { InstanceBatch } from "./internal/InstanceBatch.js";

const singleCache = (function () {
    const model2singles: WeakMap<Model, InstanceBatch.Single[]> = new WeakMap;

    return function (model: Model, subIndex: number) {
        let batches = model2singles.get(model);
        if (!batches) {
            model2singles.set(model, batches = []);
        }
        let batch = batches[subIndex];
        if (!batch) {
            batch = batches[subIndex] = new InstanceBatch.Single(model, subIndex);
        }
        return batch;
    }
})()

const multipleCache = (function () {
    const subMesh2material2multiples: WeakMap<SubMesh, WeakMap<Material, InstanceBatch.Multiple[]>> = new WeakMap;

    return function (subMesh: SubMesh, material: Material): InstanceBatch.Multiple {
        let material2multiples = subMesh2material2multiples.get(subMesh);
        if (!material2multiples) {
            material2multiples = new WeakMap;
            subMesh2material2multiples.set(subMesh, material2multiples);
        }
        let multiples = material2multiples.get(material);
        if (!multiples) {
            material2multiples.set(material, multiples = []);
        }
        let multiple = multiples.find(multiple => !multiple.locked);
        if (!multiple) {
            multiple = new InstanceBatch.Multiple(subMesh, material)
            multiples.push(multiple);
        }
        return multiple;
    }
})();

function modelCompareFn(a: Model, b: Model) {
    return a.order - b.order;
}

type Culling = 'View' | 'CSM';

export class ModelPhase extends Phase {
    constructor(
        context: Context,
        visibility: number,
        public culling: Culling = 'View',
        private _batching: boolean = false,
        /**The model type that indicates which models should run in this phase */
        private _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private _pass = 'default',
    ) {
        super(context, visibility);
    }

    record(profile: Profile, commandBuffer: CommandBuffer, renderPass: RenderPass, cameraIndex: number) {
        // profile.emit(Profile.Event.CULL_START);
        // this.culling.cull(models, Zero.instance.scene.models, this._model, cameraIndex);
        // profile.emit(Profile.Event.CULL_END);

        const data = Zero.instance.pipeline.data;
        const camera = Zero.instance.scene.cameras[cameraIndex];

        const models: Model[] = []

        switch (this.culling) {
            case 'View':
                models.push(...data.getModels(camera)!);
                break;
            case 'CSM':
                models.push(...data.shadow!.getCascades(camera)!.models[data.flowLoopIndex]);
                break;
            default:
                throw new Error(`unsupported culling: ${this.culling}`);
        }

        if (!this._batching) {
            models.sort(modelCompareFn);
        }

        const batches: InstanceBatch[] = []
        for (const model of models) {
            model.upload();

            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                if (!model.mesh.subMeshes[i].draw.count) {
                    continue;
                }

                if (!this._batching || model.descriptorSet) {
                    batches.push(singleCache(model, i));
                    continue;
                }

                const multiple = multipleCache(model.mesh.subMeshes[i], model.materials[i]);
                if (multiple.count == 0) {
                    batches.push(multiple);
                }
                multiple.add(model.transform.world_matrix);
            }
        }

        for (const batch of batches) {
            batch.upload();

            if (batch.local.descriptorSet) {
                commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, batch.local.descriptorSet);
            }

            for (const pass of batch.material.passes) {
                if (pass.type != this._pass) {
                    continue;
                }

                pass.upload();

                if (pass.descriptorSet) {
                    commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                }
                const pipeline = this._context.getPipeline(pass.state, batch.inputAssembler.vertexAttributes, renderPass, [batch.local.descriptorSetLayout, pass.descriptorSetLayout]);
                commandBuffer.bindPipeline(pipeline);
                commandBuffer.bindInputAssembler(batch.inputAssembler);
                if (batch.inputAssembler.indexInput) {
                    commandBuffer.drawIndexed(batch.draw.count, batch.draw.first, batch.count);
                } else {
                    commandBuffer.draw(batch.draw.count, batch.count);
                }
                profile.draws++;
            }

            batch.recycle();
        }
    }
}

export declare namespace ModelPhase {
    export { Culling }
}