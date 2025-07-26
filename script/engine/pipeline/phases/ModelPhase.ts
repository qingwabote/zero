import { CachedFactory, empty, RecycleQueue } from "bastard";
import { DescriptorSet } from "gfx";
import { Draw } from "../../core/render/Draw.js";
import { Batch } from "../../core/render/pipeline/Batch.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Scene } from "../../core/render/Scene.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { InstancedBatch } from "./internal/InstancedBatch.js";

const cache_keys: [Draw, DescriptorSet] = [undefined!, undefined!];

const cache: CachedFactory<typeof cache_keys, InstancedBatch[]> = new CachedFactory(function () { return []; }, true)

function compareModel(a: Model, b: Model) {
    return a.order - b.order;
}

type Frustum = 'View' | 'CSM';

export class ModelPhase extends Phase {
    constructor(
        visibility: number,
        private readonly _flowLoopIndex: number,
        private readonly _data: Data,
        private readonly _frustum: Frustum = 'View',
        /**The model type that indicates which models should run in this phase */
        private readonly _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private readonly _pass = 'default',
    ) {
        super(visibility);
    }

    batch(out: RecycleQueue<Map<Pass, Batch[]>>, scene: Scene, cameraIndex: number): void {
        let models: Iterable<Model>;
        switch (this._frustum) {
            case 'View':
                models = this._data.culling?.getView(scene.cameras[cameraIndex]).camera || scene.models;
                break;
            case 'CSM':
                models = this._data.culling?.getView(scene.cameras[cameraIndex]).shadow[this._flowLoopIndex] || scene.models;
                break;
            default:
                throw new Error(`unsupported culling: ${this._frustum}`);
        }

        const queue: Model[] = [];
        for (const model of models) {
            if (model.type == this._model) {
                queue.push(model);
            }
        }
        queue.sort(compareModel);

        let batchGroup = out.push();
        let batchGroup_order: number = 0; // The models with smaller order value will be draw first, but the models with the same order value may not be draw by their access order for better batching 
        const batch2pass: Map<InstancedBatch, Pass> = new Map;
        for (const model of queue) {
            const diff = model.order - batchGroup_order;
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                if (model.mesh.subMeshes[i].range.count == 0) {
                    continue;
                }

                for (const pass of model.materials[i].passes) {
                    if (pass.type != this._pass) {
                        continue;
                    }

                    if (diff) {
                        const batches = batchGroup.get(pass);
                        if (diff == 1 && batches) { // moving to next 
                            batchGroup.delete(pass);
                        }

                        for (const batches of batchGroup.values()) {
                            for (const batch of batches) {
                                (batch as InstancedBatch).freeze();
                            }
                        }
                        batchGroup = out.push();

                        if (diff == 1 && batches) { // moved to next
                            batchGroup.set(pass, batches);
                        }
                    }

                    let batches = batchGroup.get(pass);
                    if (!batches) {
                        batchGroup.set(pass, batches = []);
                    }

                    let batch: InstancedBatch | undefined;
                    cache_keys[0] = model.mesh.subMeshes[i];
                    cache_keys[1] = model.descriptorSet || empty.obj as DescriptorSet;
                    const bucket = cache.get(cache_keys);
                    for (const bat of bucket) {
                        if (bat.frozen) {
                            continue;
                        }

                        const p = batch2pass.get(bat);
                        if (p && p != pass) {
                            continue;
                        }

                        batch = bat;
                        break;
                    }
                    if (!batch) {
                        bucket.push(batch = new InstancedBatch(model.mesh.subMeshes[i], (model.constructor as typeof Model).INSTANCE_STRIDE, model.descriptorSet));
                    }
                    if (batch.count == 0) {
                        batches.push(batch);
                    }
                    model.upload(...batch.add())
                    batch2pass.set(batch, pass);
                }
            }

            batchGroup_order = model.order;
        }
        for (const batches of batchGroup.values()) {
            for (const batch of batches) {
                (batch as InstancedBatch).freeze();
            }
        }
    }
}

export declare namespace ModelPhase {
    export { Frustum }
}