import { CommandBuffer, DescriptorSet, DescriptorSetLayout, InputAssembler, VertexAttribute, VertexInput } from "gfx";
import { Context } from "../../core/render/Context.js";
import { BufferView } from "../../core/render/gpu/BufferView.js";
import { MemoryView } from "../../core/render/gpu/MemoryView.js";
import { Batch } from "../../core/render/pipeline/Batch.js";
import { Data } from "../../core/render/pipeline/Data.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { PeriodicFlag } from "../../core/render/scene/PeriodicFlag.js";
import { SubMesh } from "../../core/render/scene/SubMesh.js";

const inputAssembler_clone = (function () {
    function vertexInput_clone(out: VertexInput, vertexInput: VertexInput): VertexInput {
        const buffers = vertexInput.buffers;
        const buffers_size = buffers.size();
        for (let i = 0; i < buffers_size; i++) {
            out.buffers.add(buffers.get(i));
        }

        const offsets = vertexInput.offsets;
        const offsets_size = offsets.size();
        for (let i = 0; i < offsets_size; i++) {
            out.offsets.add(offsets.get(i));
        }

        return out;
    }

    return function (inputAssembler: InputAssembler): InputAssembler {
        const out = new InputAssembler;

        const vertexAttributes = inputAssembler.vertexInputState.attributes;
        const size = vertexAttributes.size();
        for (let i = 0; i < size; i++) {
            out.vertexInputState.attributes.add(vertexAttributes.get(i));
        }
        out.vertexInputState.primitive = inputAssembler.vertexInputState.primitive;

        vertexInput_clone(out.vertexInput, inputAssembler.vertexInput);

        if (inputAssembler.indexInput) {
            out.indexInput = inputAssembler.indexInput;
        }

        return out;
    }
})()

class InstancedBatch implements Batch {
    private _countFlag = new PeriodicFlag();
    get count(): number {
        return this._countFlag.value;
    }

    private _frozenFlag = new PeriodicFlag();
    get frozen(): boolean {
        return this._frozenFlag.value != 0;
    }

    constructor(
        readonly inputAssembler: InputAssembler,
        readonly draw: Readonly<SubMesh.Draw>,
        readonly vertexes: BufferView,
        readonly descriptorSetLayout: DescriptorSetLayout | undefined = undefined,
        readonly descriptorSet: DescriptorSet | undefined = undefined,
        readonly uniforms: Readonly<Record<string, MemoryView>> | undefined = undefined
    ) { }

    reset(): void {
        this.vertexes.reset();
        for (const key in this.uniforms) {
            this.uniforms[key].reset();
        }
    }

    next() {
        this._countFlag.reset(this._countFlag.value + 1);
    }

    upload(commandBuffer: CommandBuffer): void {
        this.vertexes.update(commandBuffer);
        for (const key in this.uniforms) {
            this.uniforms[key].update(commandBuffer);
        }
        this._frozenFlag.reset(1);
    }
}

const batchCache = (function () {
    const subMesh2batches: WeakMap<SubMesh, InstancedBatch[]> = new WeakMap;
    const batch2pass: WeakMap<InstancedBatch, Pass> = new WeakMap;
    return function (pass: Pass, model: Model, subMeshIndex: number): InstancedBatch {
        const subMesh = model.mesh.subMeshes[subMeshIndex];
        let batches = subMesh2batches.get(subMesh);
        if (!batches) {
            subMesh2batches.set(subMesh, batches = []);
        }
        let batch: InstancedBatch | undefined;
        for (const b of batches) {
            if (b.frozen) {
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
            const ia = inputAssembler_clone(subMesh.inputAssembler);
            const info = model.batch();
            for (const attr of info.attributes) {
                const attribute = new VertexAttribute;
                attribute.location = attr.location;
                attribute.format = attr.format;
                attribute.offset = attr.offset;
                attribute.multiple = attr.multiple;
                attribute.buffer = ia.vertexInput.buffers.size();
                attribute.instanced = true;
                ia.vertexInputState.attributes.add(attribute);
            }
            ia.vertexInput.buffers.add(info.vertexes.buffer);
            ia.vertexInput.offsets.add(0);

            batch = new InstancedBatch(ia, subMesh.draw, info.vertexes, info.descriptorSet?.layout, info.descriptorSet, info.uniforms);
            batches.push(batch);
            batch2pass.set(batch, pass);
        }
        return batch;
    }
})();

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

    queue(buffer_pass: Pass[], buffer_batch: Batch[], buffer_index: number, context: Context, cameraIndex: number): number {
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

        const pass2batches: Map<Pass, InstancedBatch[]> = new Map;
        let pass2batches_order: number = 0;
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
                        if (diff == 1 && batches) {
                            pass2batches.delete(pass);
                        }

                        for (const [pass, batches] of pass2batches) {
                            pass.upload(context.commandBuffer);
                            for (const batch of batches) {
                                batch.upload(context.commandBuffer);
                                buffer_pass[buffer_index] = pass;
                                buffer_batch[buffer_index] = batch;
                                buffer_index++;
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

                    const batch = batchCache(pass, model, i);
                    if (batch.count == 0) {
                        batch.reset();
                        batches.push(batch);
                    }
                    model.batchFill(batch.vertexes, batch.uniforms)
                    batch.next();
                }
            }

            pass2batches_order = model.order;
        }
        for (const [pass, batches] of pass2batches) {
            pass.upload(context.commandBuffer);
            for (const batch of batches) {
                batch.upload(context.commandBuffer);
                buffer_pass[buffer_index] = pass;
                buffer_batch[buffer_index] = batch;
                buffer_index++;
            }
        }

        return buffer_index;
    }
}

export declare namespace ModelPhase {
    export { Culling }
}