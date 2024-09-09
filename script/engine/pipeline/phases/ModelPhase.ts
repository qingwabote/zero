import { CommandBuffer, DescriptorSet, DescriptorSetLayout, Pipeline, RenderPass } from "gfx";
import { Zero } from "../../core/Zero.js";
import { Context } from "../../core/render/pipeline/Context.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { SubMesh } from "../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../core/shaderLib.js";
import { InstanceBatch } from "./internal/InstanceBatch.js";

interface PB {
    pass: Pass,
    batch: InstanceBatch
}

const decodeModel = (function () {
    const batchCache = (function () {
        const subMesh2batches: WeakMap<SubMesh, InstanceBatch[]> = new WeakMap;
        const batch2pass: WeakMap<InstanceBatch, Pass> = new WeakMap;
        return function (pass: Pass, subMesh: SubMesh, descriptorSetLayout: DescriptorSetLayout, descriptorSet?: DescriptorSet): InstanceBatch {
            let batches = subMesh2batches.get(subMesh);
            if (!batches) {
                subMesh2batches.set(subMesh, batches = []);
            }
            let batch: InstanceBatch | undefined;
            for (const b of batches) {
                if (b.locked) {
                    continue;
                }
                if (b.descriptorSet != descriptorSet) {
                    continue;
                }
                const p = batch2pass.get(b);
                if (p && p != pass) {
                    continue;
                }
                batch = b;
                break;
            }
            if (!batch) {
                batch = new InstanceBatch(subMesh, descriptorSetLayout, descriptorSet)
                batches.push(batch);
                batch2pass.set(batch, pass);
            }
            return batch;
        }
    })();

    return function* (models: Model[], passType: string) {
        const pass2batches: Map<Pass, InstanceBatch[]> = new Map;
        let pass2batches_order: number = 0;
        const pb: PB = { pass: null!, batch: null! }
        for (const model of models) {
            const diff = model.order - pass2batches_order;
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                if (model.mesh.subMeshes[i].draw.count == 0) {
                    continue;
                }

                for (const pass of model.materials[i].passes) {
                    if (pass.type != passType) {
                        continue;
                    }

                    if (diff) {
                        const batches = pass2batches.get(pass);
                        if (diff == 1 && batches) {
                            pass2batches.delete(pass);
                        }

                        for (const [pass, batches] of pass2batches) {
                            for (const batch of batches) {
                                pb.pass = pass;
                                pb.batch = batch;
                                yield pb;
                            }
                        }
                        pass2batches.clear();

                        if (diff == 1 && batches) {
                            pass2batches.set(pass, batches);
                        }
                    }

                    let batches = pass2batches.get(pass);
                    if (!batches) {
                        pass2batches.set(pass, batches = []);
                    }

                    const batch = batchCache(pass, model.mesh.subMeshes[i], (model.constructor as typeof Model).descriptorSetLayout, model.descriptorSet);
                    if (batch.count == 0) {
                        batches.push(batch);
                    }
                    batch.add(model);
                }
            }

            pass2batches_order = model.order;
        }
        for (const [pass, batches] of pass2batches) {
            for (const batch of batches) {
                pb.pass = pass;
                pb.batch = batch;
                yield pb;
            }
        }
    }
})()

function compareModel(a: Model, b: Model) {
    return a.order - b.order;
}

type Culling = 'View' | 'CSM';

export class ModelPhase extends Phase {
    constructor(
        context: Context,
        visibility: number,
        public culling: Culling = 'View',
        /**The model type that indicates which models should run in this phase */
        private _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private _pass = 'default',
    ) {
        super(context, visibility);
    }

    record(profile: Profile, commandBuffer: CommandBuffer, renderPass: RenderPass) {
        const data = Zero.instance.pipeline.data;

        let models: Iterable<Model>;
        switch (this.culling) {
            case 'View':
                models = data.culling?.getView(data.current_camera).camera || Zero.instance.scene.models;
                break;
            case 'CSM':
                models = data.culling?.getView(data.current_camera).shadow[data.flowLoopIndex] || Zero.instance.scene.models;
                break;
            default:
                throw new Error(`unsupported culling: ${this.culling}`);
        }

        const modelQueue: Model[] = [];
        for (const model of models) {
            if (model.type != this._model) {
                continue;
            }

            model.upload();
            modelQueue.push(model);
        }
        modelQueue.sort(compareModel);

        let current_pass: Pass | undefined;
        let current_pipeline: Pipeline | undefined;
        for (const { pass, batch } of decodeModel(modelQueue, this._pass)) {
            if (current_pass != pass) {
                pass.upload();
                if (pass.descriptorSet) {
                    commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                }
                current_pass = pass;

                profile.passes++;
            }

            batch.upload();

            if (batch.descriptorSet) {
                commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, batch.descriptorSet);
            }

            const pipeline = this._context.getPipeline(pass.state, batch.inputAssembler.vertexInputState, renderPass, [pass.descriptorSetLayout, batch.descriptorSetLayout]);
            if (current_pipeline != pipeline) {
                commandBuffer.bindPipeline(pipeline);
                current_pipeline = pipeline;

                profile.pipelines++;
            }

            commandBuffer.bindInputAssembler(batch.inputAssembler);

            if (batch.inputAssembler.indexInput) {
                commandBuffer.drawIndexed(batch.draw.count, batch.draw.first, batch.count);
            } else {
                commandBuffer.draw(batch.draw.count, batch.draw.first, batch.count);
            }
            profile.draws++;

            batch.recycle();
        }
    }
}
ModelPhase.InstanceBatch = InstanceBatch;

export declare namespace ModelPhase {
    export { Culling, InstanceBatch }
}