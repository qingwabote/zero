import { RecyclePool } from "bastard";
import { CommandBuffer, Pipeline, RenderPass } from "gfx";
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
    batch: InstanceBatch;
}

interface PbQueueBuilder {
    add(pass: Pass, model: Model, subIndex: number): void;
    dump(): Iterable<PB>;
}

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
    const subMesh2multiples: WeakMap<SubMesh, InstanceBatch.Multiple[]> = new WeakMap;
    return function (subMesh: SubMesh): InstanceBatch.Multiple {
        let multiples = subMesh2multiples.get(subMesh);
        if (!multiples) {
            subMesh2multiples.set(subMesh, multiples = []);
        }
        let multiple = multiples.find(multiple => !multiple.locked);
        if (!multiple) {
            multiple = new InstanceBatch.Multiple(subMesh)
            multiples.push(multiple);
        }
        return multiple;
    }
})();

const pmQueueBuilder: PbQueueBuilder = (function () {
    const pass2batches: Map<Pass, InstanceBatch[]> = new Map;
    const pb: PB = { pass: null!, batch: null! };
    return {
        add: function (pass: Pass, model: Model, subIndex: number): void {
            let batches = pass2batches.get(pass);
            if (!batches) {
                pass2batches.set(pass, batches = []);
            }

            // fallback
            if (model.descriptorSet) {
                batches.push(singleCache(model, subIndex));
                return;
            }

            const multiple = multipleCache(model.mesh.subMeshes[subIndex]);
            if (multiple.count == 0) {
                batches.push(multiple);
            }
            multiple.add(model);
        },

        dump: function* () {
            for (const [pass, batches] of pass2batches) {
                for (const batch of batches) {
                    pb.pass = pass;
                    pb.batch = batch;
                    yield pb;
                }
            }
            pass2batches.clear();
        }
    }
})()

const psQueueBuilder: PbQueueBuilder = (function () {
    interface PS extends PB {
        batch: InstanceBatch.Single;
    }

    function compareFn(a: PS, b: PS) {
        return a.batch.model.order - b.batch.model.order || a.pass.id - b.pass.id;
    }

    const pool: RecyclePool<PS> = new RecyclePool(() => { return { pass: null!, batch: null! } });
    const queue: PS[] = [];
    return {
        add: function (pass: Pass, model: Model, subIndex: number): void {
            const pb = pool.get();
            pb.pass = pass;
            pb.batch = singleCache(model, subIndex);
            queue.push(pb);
        },

        dump: function* () {
            queue.sort(compareFn);

            yield* queue;

            pool.recycle();
            queue.length = 0;
        }
    }
})()

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

        const pbQueueBuilder: PbQueueBuilder = this._batching ? pmQueueBuilder : psQueueBuilder;
        for (const model of models) {
            if (model.type != this._model) {
                continue;
            }

            model.upload();

            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                if (model.mesh.subMeshes[i].draw.count == 0) {
                    continue;
                }

                for (const pass of model.materials[i].passes) {
                    if (pass.type != this._pass) {
                        continue;
                    }
                    pbQueueBuilder.add(pass, model, i);
                }
            }
        }

        let current_pass: Pass | undefined;
        let current_pipeline: Pipeline | undefined;
        for (const { pass, batch } of pbQueueBuilder.dump()) {
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