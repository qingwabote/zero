import { RecyclePool } from "bastard";
import { CommandBuffer, Pipeline, PrimitiveTopology, RenderPass } from "gfx";
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

interface PS extends PB {
    batch: InstanceBatch.Single;
}

const ps_pool: RecyclePool<PS> = new RecyclePool(() => { return { pass: null!, batch: null! } })

function ps_compareFn(a: PS, b: PS) {
    return a.batch.model.order - b.batch.model.order || a.pass.id - b.pass.id;
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

type Culling = 'View' | 'CSM';

export class ModelPhase extends Phase {
    static subDraws = 1;

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

        let pbIterable: Iterable<PB>;
        if (this._batching) {
            const pass2batches: Map<Pass, InstanceBatch[]> = new Map;
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

                        let batches = pass2batches.get(pass);
                        if (!batches) {
                            pass2batches.set(pass, batches = []);
                        }

                        // fallback
                        if (model.descriptorSet) {
                            batches.push(singleCache(model, i));
                            continue;
                        }

                        const multiple = multipleCache(model.mesh.subMeshes[i]);
                        if (multiple.count == 0) {
                            batches.push(multiple);
                        }
                        multiple.add(model.transform.world_matrix);
                    }
                }
            }

            const pb: PB = { pass: null!, batch: null! };
            pbIterable = (function* () {
                for (const [pass, batches] of pass2batches) {
                    pass.upload();
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                    }
                    profile.passes++;

                    for (const batch of batches) {
                        pb.pass = pass;
                        pb.batch = batch;
                        yield pb;
                    }
                }
            })();
        } else {
            const queue: PS[] = [];
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

                        const pb = ps_pool.get();
                        pb.pass = pass;
                        pb.batch = singleCache(model, i);
                        queue.push(pb);
                    }
                }
            }

            queue.sort(ps_compareFn);

            let current_pass: Pass | undefined;
            pbIterable = (function* () {
                for (const pb of queue) {
                    const pass = pb.pass;
                    if (current_pass != pass) {
                        pass.upload();
                        if (pass.descriptorSet) {
                            commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                        }
                        current_pass = pass;

                        profile.passes++;
                    }

                    yield pb;
                }
            })();
        }

        let current_pipeline: Pipeline | undefined;
        for (const { batch, pass } of pbIterable) {
            batch.upload();

            if (batch.local.descriptorSet) {
                commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, batch.local.descriptorSet);
            }

            const pipeline = this._context.getPipeline(pass.state, batch.inputAssembler.vertexInputState, renderPass, [pass.descriptorSetLayout, batch.local.descriptorSetLayout]);
            if (current_pipeline != pipeline) {
                commandBuffer.bindPipeline(pipeline);
                current_pipeline = pipeline;

                profile.pipelines++;
            }

            commandBuffer.bindInputAssembler(batch.inputAssembler);

            let alignment;
            switch (batch.inputAssembler.vertexInputState.primitive) {
                case PrimitiveTopology.LINE_LIST:
                    alignment = 2;
                    break;
                case PrimitiveTopology.TRIANGLE_LIST:
                    alignment = 3;
                    break;
                default:
                    throw `unsupported primitive: ${batch.inputAssembler.vertexInputState.primitive}`
            }

            const subCount = Math.ceil(batch.draw.count / ModelPhase.subDraws / alignment) * alignment;

            let count = 0;
            while (count < batch.draw.count) {
                if (batch.inputAssembler.indexInput) {
                    commandBuffer.drawIndexed(count + subCount > batch.draw.count ? batch.draw.count - count : subCount, batch.draw.first + count, batch.count);
                } else {
                    commandBuffer.draw(count + subCount > batch.draw.count ? batch.draw.count - count : subCount, batch.draw.first + count, batch.count);
                }
                count += subCount;
                profile.draws++;
            }

            batch.recycle();
        }

        ps_pool.recycle();
    }
}
ModelPhase.InstanceBatch = InstanceBatch;

export declare namespace ModelPhase {
    export { Culling, InstanceBatch }
}