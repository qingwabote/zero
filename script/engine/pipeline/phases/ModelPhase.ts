import { RecyclePool } from "bastard";
import { CommandBuffer, RenderPass } from "gfx";
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
    batch: InstanceBatch.Single;
}

const pbPool: RecyclePool<PB> = new RecyclePool(() => { return { pass: null, batch: null } as unknown as PB })

function pbCompareFn(a: PB, b: PB) {
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

            for (const [pass, batches] of pass2batches) {
                pass.upload();
                if (pass.descriptorSet) {
                    commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                }

                for (const batch of batches) {
                    batch.record(profile, commandBuffer, renderPass, this._context, pass.state);
                }

                profile.passes++;
            }
        } else {
            const pbQueue: PB[] = [];
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

                        const pb = pbPool.get();
                        pb.pass = pass;
                        pb.batch = singleCache(model, i);
                        pbQueue.push(pb);
                    }
                }
            }

            pbQueue.sort(pbCompareFn);

            let current_pass;
            for (const pb of pbQueue) {
                const pass = pb.pass;
                if (current_pass != pass) {
                    pass.upload();
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                    }
                    current_pass = pass;

                    profile.passes++;
                }

                pb.batch.record(profile, commandBuffer, renderPass, this._context, pass.state);
            }

            pbPool.recycle();
        }
    }
}
ModelPhase.InstanceBatch = InstanceBatch;

export declare namespace ModelPhase {
    export { Culling, InstanceBatch }
}