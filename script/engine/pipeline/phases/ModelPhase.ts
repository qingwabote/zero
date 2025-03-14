import { CachedFactory, empty, RecycleQueue } from "bastard";
import { BufferUsageFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayout, Format, InputAssembler, VertexAttribute } from "gfx";
import { Context } from "../../core/render/Context.js";
import { BufferView } from "../../core/render/gpu/BufferView.js";
import { MemoryView } from "../../core/render/gpu/MemoryView.js";
import { Batch } from "../../core/render/pipeline/Batch.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { Periodic } from "../../core/render/scene/Periodic.js";
import { SubMesh } from "../../core/render/scene/SubMesh.js";
import { gfxUtil } from "../../gfxUtil.js";

class InstancedBatch implements Batch {
    readonly attributes: Readonly<Record<string, MemoryView>>;

    private _uploadFlag: Periodic = new Periodic(0, 0);
    get uploaded(): boolean {
        return this._uploadFlag.value != 0;
    }

    readonly inputAssembler: InputAssembler;
    readonly draw: Readonly<SubMesh.Draw>;
    private _countFlag: Periodic = new Periodic(0, 0);
    get count(): number {
        return this._countFlag.value;
    }
    readonly descriptorSetLayout: DescriptorSetLayout | undefined;

    constructor(subMesh: SubMesh, attributes: readonly Model.InstancedAttribute[], readonly descriptorSet?: DescriptorSet) {
        const ia = gfxUtil.cloneInputAssembler(subMesh.inputAssembler);
        const attributeViews: Record<string, BufferView> = {};
        for (const attr of attributes) {
            const attribute = new VertexAttribute;
            attribute.location = attr.location;
            attribute.format = attr.format;
            attribute.multiple = attr.multiple || 1;
            attribute.buffer = ia.vertexInput.buffers.size();
            attribute.instanced = true;
            ia.vertexInputState.attributes.add(attribute);

            let view: BufferView;
            switch (attr.format) {
                case Format.R16_UINT:
                    view = new BufferView('Uint16', BufferUsageFlagBits.VERTEX);
                    break;
                case Format.R32_UINT:
                    view = new BufferView('Uint32', BufferUsageFlagBits.VERTEX);
                    break;
                case Format.RGBA32_SFLOAT:
                    view = new BufferView('Float32', BufferUsageFlagBits.VERTEX);
                    break;
                default:
                    throw new Error(`unsupported attribute format: ${attr.format}`);
            }
            ia.vertexInput.buffers.add(view.buffer);
            ia.vertexInput.offsets.add(0);
            attributeViews[attr.location] = view;
        }
        this.attributes = attributeViews;

        this.inputAssembler = ia;
        this.draw = subMesh.draw;
        this.descriptorSetLayout = descriptorSet?.layout;
    }

    next() {
        this._countFlag.value++;
    }

    upload(commandBuffer: CommandBuffer): void {
        for (const key in this.attributes) {
            this.attributes[key].update(commandBuffer);
        }
        this._uploadFlag.value = 1;
    }

    reset(): void {
        for (const key in this.attributes) {
            this.attributes[key].reset();
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

    batch(out: RecycleQueue<Map<Pass, Batch[]>>, context: Context, commandBuffer: CommandBuffer, cameraIndex: number): void {
        let models: Iterable<Model>;
        switch (this._culling) {
            case 'View':
                models = this._data.culling?.getView(context.scene.cameras[cameraIndex]).camera || context.scene.models;
                break;
            case 'CSM':
                models = this._data.culling?.getView(context.scene.cameras[cameraIndex]).shadow[this._flowLoopIndex] || context.scene.models;
                break;
            default:
                throw new Error(`unsupported culling: ${this._culling}`);
        }

        const modelQueue: Model[] = [];
        for (const model of models) {
            if (model.type == this._model) {
                modelQueue.push(model);
            }
        }
        modelQueue.sort(compareModel);

        let pass2batches = out.push();
        let pass2batches_order: number = 0; // The models with smaller order value will be draw first, but the models with the same order value may not be draw by their access order for better batching 
        const batch2pass: Map<InstancedBatch, Pass> = new Map;
        for (const model of modelQueue) {
            const diff = model.order - pass2batches_order;
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                if (model.mesh.subMeshes[i].draw.count == 0) {
                    continue;
                }

                for (const pass of model.materials[i].passes) {
                    if (pass.type != this._pass) {
                        continue;
                    }

                    if (diff) {
                        const batches = pass2batches.get(pass);
                        if (diff == 1 && batches) { // moving to next 
                            pass2batches.delete(pass);
                        }

                        context.profile.emit(Profile.Event.BATCH_UPLOAD_START)
                        for (const [pass, batches] of pass2batches) {
                            pass.upload(commandBuffer);
                            for (const batch of batches) {
                                (batch as InstancedBatch).upload(commandBuffer);
                            }
                        }
                        context.profile.emit(Profile.Event.BATCH_UPLOAD_END)
                        pass2batches = out.push();

                        if (diff == 1 && batches) { // moved to next
                            pass2batches.set(pass, batches);
                        }
                    }

                    let batches = pass2batches.get(pass);
                    if (!batches) {
                        pass2batches.set(pass, batches = []);
                    }

                    let batch: InstancedBatch | undefined;
                    cache_keys[0] = model.mesh.subMeshes[i];
                    cache_keys[1] = model.descriptorSet || empty.obj as DescriptorSet;
                    const bucket = cache.get(cache_keys);
                    for (const bat of bucket) {
                        if (bat.uploaded) {
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
                        batch = new InstancedBatch(model.mesh.subMeshes[i], (model.constructor as typeof Model).attributes, model.descriptorSet);
                        bucket.push(batch);
                    }
                    if (batch.count == 0) {
                        batch.reset();
                        batches.push(batch);
                    }
                    model.upload(batch.attributes)
                    batch.next();
                    batch2pass.set(batch, pass);
                }
            }

            pass2batches_order = model.order;
        }
        context.profile.emit(Profile.Event.BATCH_UPLOAD_START)
        for (const [pass, batches] of pass2batches) {
            pass.upload(commandBuffer);
            for (const batch of batches) {
                (batch as InstancedBatch).upload(commandBuffer);
            }
        }
        context.profile.emit(Profile.Event.BATCH_UPLOAD_END)
    }
}

export declare namespace ModelPhase {
    export { Culling }
}