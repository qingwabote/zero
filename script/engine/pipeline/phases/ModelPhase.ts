import { CachedFactory, empty, RecycleQueue } from "bastard";
import { device } from "boot";
import { BufferUsageFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayout, DescriptorType, InputAssembler } from "gfx";
import { BufferView } from "../../core/render/gfx/BufferView.js";
import { MemoryView } from "../../core/render/gfx/MemoryView.js";
import { Batch } from "../../core/render/pipeline/Batch.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Scene } from "../../core/render/Scene.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { SubMesh } from "../../core/render/scene/SubMesh.js";
import { Transient } from "../../core/render/scene/Transient.js";

class InstancedBatch implements Batch {
    readonly properties: Readonly<Record<string, MemoryView>>;

    private _frozen: Transient = new Transient(0, 0);
    get frozen(): boolean {
        return this._frozen.value != 0;
    }

    readonly inputAssembler: InputAssembler;
    readonly draw: Readonly<SubMesh.Draw>;

    private _count: number = 0
    get count(): number {
        return this._count;
    }

    readonly instanced: Batch.ResourceBinding;

    constructor(subMesh: SubMesh, properties: DescriptorSetLayout, readonly local?: Batch.ResourceBinding) {
        this.inputAssembler = subMesh.inputAssembler;
        this.draw = subMesh.draw;

        const descriptorSet = device.createDescriptorSet(properties);
        const propertyViews: Record<string, MemoryView> = {};
        const bindings = properties.info.bindings;
        for (let i = 0; i < bindings.size(); i++) {
            const binding = bindings.get(i);
            let view: MemoryView;
            switch (binding.descriptorType) {
                case DescriptorType.UNIFORM_BUFFER:
                    const buffer = new BufferView('f32', BufferUsageFlagBits.UNIFORM, 0, 256 * 16);
                    descriptorSet.bindBuffer(binding.binding, buffer.buffer);
                    view = buffer;
                    break;
                default:
                    throw new Error(`unsupported type: ${binding.descriptorType}`);
            }
            propertyViews[binding.binding] = view;
        }

        this.instanced = { descriptorSetLayout: properties, descriptorSet };
        this.properties = propertyViews;
    }

    next() {
        this._count++;
    }

    freeze() {
        this._frozen.value = 1;
    }

    flush(commandBuffer: CommandBuffer): number {
        for (const key in this.properties) {
            this.properties[key].update(commandBuffer).reset();
        }
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
                        bucket.push(batch = new InstancedBatch(model.mesh.subMeshes[i], (model.constructor as typeof Model).properties, local));
                    }
                    if (batch.count == 0) {
                        batches.push(batch);
                    }
                    model.upload(batch.properties)
                    batch.next();
                    batch2pass.set(batch, pass);
                }
            }

            batchGroup_order = model.order;
        }
    }
}

export declare namespace ModelPhase {
    export { Frustum }
}