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
    readonly attributes: Readonly<Record<string, MemoryView>>;
    readonly properties: Readonly<Record<string, MemoryView>>;

    private _frozen: Transient = new Transient(0, 0);
    get frozen(): boolean {
        return this._frozen.value != 0;
    }

    readonly inputAssembler: InputAssembler;
    readonly draw: Readonly<SubMesh.Draw>;
    private _countFlag: Transient = new Transient(0, 0);
    get count(): number {
        return this._countFlag.value;
    }

    readonly instanced: Batch.ResourceBinding;

    constructor(subMesh: SubMesh, attributes: readonly Model.InstancedAttribute[], properties: DescriptorSetLayout, readonly local?: Batch.ResourceBinding) {
        const attributeViews: Record<string, BufferView> = {};
        // const ia = gfxUtil.cloneInputAssembler(subMesh.inputAssembler);
        // for (const attr of attributes) {
        //     const attribute = new VertexAttribute;
        //     attribute.location = attr.location;
        //     attribute.format = attr.format;
        //     attribute.multiple = attr.multiple || 1;
        //     attribute.buffer = ia.vertexInput.buffers.size();
        //     attribute.instanced = true;
        //     ia.vertexInputState.attributes.add(attribute);

        //     let view: BufferView;
        //     switch (attr.format) {
        //         case Format.R16_UINT:
        //             view = new BufferView('u16', BufferUsageFlagBits.VERTEX);
        //             break;
        //         case Format.R32_UINT:
        //             view = new BufferView('u32', BufferUsageFlagBits.VERTEX);
        //             break;
        //         case Format.RGBA32_SFLOAT:
        //             view = new BufferView('f32', BufferUsageFlagBits.VERTEX);
        //             break;
        //         default:
        //             throw new Error(`unsupported attribute format: ${attr.format}`);
        //     }
        //     ia.vertexInput.buffers.add(view.buffer);
        //     ia.vertexInput.offsets.add(0);
        //     attributeViews[attr.location] = view;
        // }
        this.attributes = attributeViews;
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
        this._countFlag.value++;
    }

    freeze() {
        this._frozen.value = 1;
    }

    upload(commandBuffer: CommandBuffer): void {
        for (const key in this.attributes) {
            this.attributes[key].update(commandBuffer);
        }
        for (const key in this.properties) {
            this.properties[key].update(commandBuffer);
        }
    }

    reset(): void {
        for (const key in this.attributes) {
            this.attributes[key].reset();
        }
        for (const key in this.properties) {
            this.properties[key].reset();
        }
    }
}

const cache_keys: [SubMesh, DescriptorSet] = [undefined!, undefined!];

const cache: CachedFactory<typeof cache_keys, InstancedBatch[]> = new CachedFactory(function () { return []; }, true)

function compareModel(a: Model, b: Model) {
    return a.order - b.order;
}

type Culling = 'View' | 'CSM';

export class ModelPhase extends Phase {
    constructor(
        visibility: number,
        private readonly _flowLoopIndex: number,
        private readonly _data: Data,
        private readonly _culling: Culling = 'View',
        /**The model type that indicates which models should run in this phase */
        private readonly _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private readonly _pass = 'default',
    ) {
        super(visibility);
    }

    batch(out: RecycleQueue<Map<Pass, Batch[]>>, scene: Scene, cameraIndex: number): void {
        let models: Iterable<Model>;
        switch (this._culling) {
            case 'View':
                models = this._data.culling?.getView(scene.cameras[cameraIndex]).camera || scene.models;
                break;
            case 'CSM':
                models = this._data.culling?.getView(scene.cameras[cameraIndex]).shadow[this._flowLoopIndex] || scene.models;
                break;
            default:
                throw new Error(`unsupported culling: ${this._culling}`);
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
                        if (bat.count > 255) {
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
                        bucket.push(batch = new InstancedBatch(model.mesh.subMeshes[i], (model.constructor as typeof Model).attributes, (model.constructor as typeof Model).properties, local));
                    }
                    if (batch.count == 0) {
                        batch.reset();
                        batches.push(batch);
                    }
                    model.upload(batch.attributes, batch.properties)
                    batch.next();
                    batch2pass.set(batch, pass);
                }
            }

            batchGroup_order = model.order;
        }
    }
}

export declare namespace ModelPhase {
    export { Culling }
}