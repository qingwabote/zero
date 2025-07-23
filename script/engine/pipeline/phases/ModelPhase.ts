import { CachedFactory, empty, RecycleQueue } from "bastard";
import { device } from "boot";
import { BufferUsageFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayout, DescriptorType, InputAssembler, ShaderStageFlagBits } from "gfx";
import { BufferView } from "../../core/render/gfx/BufferView.js";
import { Batch } from "../../core/render/pipeline/Batch.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Scene } from "../../core/render/Scene.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { SubMesh } from "../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../core/shaderLib.js";

const instanceLayout: DescriptorSetLayout = shaderLib.createDescriptorSetLayout([{
    type: DescriptorType.UNIFORM_BUFFER,
    stageFlags: ShaderStageFlagBits.VERTEX,
    binding: 0
}]);

const INSTANCE_UBO_LENGTH = 16 * 1024 / 4;

class InstancedBatch implements Batch {
    readonly inputAssembler: InputAssembler;
    readonly draw: Readonly<SubMesh.Draw>;

    readonly instance: Batch.ResourceBinding;
    readonly data: BufferView;

    private _count: number = 0
    get count(): number {
        return this._count;
    }

    private _frozen = false;
    get frozen(): boolean {
        return this._frozen;
    }

    constructor(subMesh: SubMesh, readonly local?: Batch.ResourceBinding) {
        this.inputAssembler = subMesh.inputAssembler;
        this.draw = subMesh.draw;

        const descriptorSet = device.createDescriptorSet(instanceLayout);
        const view = new BufferView('f32', BufferUsageFlagBits.UNIFORM, 0, INSTANCE_UBO_LENGTH);
        descriptorSet.bindBuffer(0, view.buffer);

        this.instance = { descriptorSetLayout: instanceLayout, descriptorSet };
        this.data = view;
    }

    next() {
        this._count++;
    }

    freeze() {
        this._frozen = true;
    }

    flush(commandBuffer: CommandBuffer): number {
        this.data.update(commandBuffer).reset();
        this._frozen = false;
        const count = this._count;
        this._count = 0;
        return count;
    }
}

const cache_keys: [SubMesh, DescriptorSet] = [undefined!, undefined!];

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
                if (model.mesh.subMeshes[i].draw.count == 0) {
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

                        for (const [_, batches] of batchGroup) {
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
                        if (bat.count > 203) {
                            continue;
                        }

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
                        const local = model.descriptorSet ? { descriptorSetLayout: (model.constructor as typeof Model).descriptorSetLayout!, descriptorSet: model.descriptorSet } : undefined
                        bucket.push(batch = new InstancedBatch(model.mesh.subMeshes[i], local));
                    }
                    if (batch.count == 0) {
                        batches.push(batch);
                    }
                    model.upload(batch.data)
                    batch.next();
                    batch2pass.set(batch, pass);
                }
            }

            batchGroup_order = model.order;
        }
        for (const [_, batches] of batchGroup) {
            for (const batch of batches) {
                (batch as InstancedBatch).freeze();
            }
        }
    }
}

export declare namespace ModelPhase {
    export { Frustum }
}