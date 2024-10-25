import { device } from "boot";
import { CommandBuffer, DescriptorSet, DescriptorSetLayout, DescriptorSetLayoutInfo, InputAssembler, Pipeline, RenderPass, VertexAttribute, VertexInput } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/gpu/BufferView.js";
import { MemoryView } from "../../core/render/gpu/MemoryView.js";
import { Context } from "../../core/render/pipeline/Context.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { Model } from "../../core/render/scene/Model.js";
import { Pass } from "../../core/render/scene/Pass.js";
import { PeriodicFlag } from "../../core/render/scene/PeriodicFlag.js";
import { SubMesh } from "../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../core/shaderLib.js";

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

const descriptorSetLayoutNull = device.createDescriptorSetLayout(new DescriptorSetLayoutInfo);

class InstanceBatch {
    private _count = 0;
    get count(): number {
        return this._count;
    }

    private _lockFlag = new PeriodicFlag();
    get locked(): boolean {
        return this._lockFlag.value != 0;
    }

    constructor(readonly inputAssembler: InputAssembler, readonly draw: Readonly<SubMesh.Draw>, readonly vertexes: BufferView, readonly descriptorSetLayout: DescriptorSetLayout = descriptorSetLayoutNull, readonly descriptorSet?: DescriptorSet, readonly uniforms?: Readonly<Record<string, MemoryView>>) { }

    next() {
        this._count++;
    }

    upload(commandBuffer: CommandBuffer): void {
        this.vertexes.update(commandBuffer);
        for (const key in this.uniforms) {
            this.uniforms[key].update(commandBuffer);
        }
    }

    recycle(): void {
        this.vertexes.reset();
        for (const key in this.uniforms) {
            this.uniforms[key].reset();
        }
        this._count = 0;
        this._lockFlag.reset(1);
    }
}

const batchCache = (function () {
    const subMesh2batches: WeakMap<SubMesh, InstanceBatch[]> = new WeakMap;
    const batch2pass: WeakMap<InstanceBatch, Pass> = new WeakMap;
    return function (pass: Pass, model: Model, subMeshIndex: number): InstanceBatch {
        const subMesh = model.mesh.subMeshes[subMeshIndex];
        let batches = subMesh2batches.get(subMesh);
        if (!batches) {
            subMesh2batches.set(subMesh, batches = []);
        }
        let batch: InstanceBatch | undefined;
        for (const b of batches) {
            if (b.locked) {
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

            batch = new InstanceBatch(ia, subMesh.draw, info.vertexes, info.descriptorSet?.layout, info.descriptorSet, info.uniforms);
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
    private _pb_buffer: [Pass, InstanceBatch][] = [];
    private _pb_count: number = 0;

    constructor(
        context: Context,
        visibility: number,
        private readonly _flowLoopIndex: number,
        private readonly _culling: Culling = 'View',
        /**The model type that indicates which models should run in this phase */
        private readonly _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private readonly _pass = 'default',
    ) {
        super(context, visibility);
    }

    update(commandBuffer: CommandBuffer): void {
        const data = Zero.instance.pipeline.data;

        let models: Iterable<Model>;
        switch (this._culling) {
            case 'View':
                models = data.culling?.getView(data.current_camera).camera || Zero.instance.scene.models;
                break;
            case 'CSM':
                models = data.culling?.getView(data.current_camera).shadow[this._flowLoopIndex] || Zero.instance.scene.models;
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

        this._pb_count = 0;
        const pass2batches: Map<Pass, InstanceBatch[]> = new Map;
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
                            for (const batch of batches) {
                                if (this._pb_buffer.length > this._pb_count) {
                                    this._pb_buffer[this._pb_count][0] = pass
                                    this._pb_buffer[this._pb_count][1] = batch
                                } else {
                                    this._pb_buffer.push([pass, batch]);
                                }
                                this._pb_count++;
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
                        batches.push(batch);
                    }
                    model.batchFill(batch.vertexes, batch.uniforms)
                    batch.next();
                }
            }

            pass2batches_order = model.order;
        }
        for (const [pass, batches] of pass2batches) {
            for (const batch of batches) {
                if (this._pb_buffer.length > this._pb_count) {
                    this._pb_buffer[this._pb_count][0] = pass
                    this._pb_buffer[this._pb_count][1] = batch
                } else {
                    this._pb_buffer.push([pass, batch]);
                }
                this._pb_count++;
            }
        }
        for (let i = 0; i < this._pb_count; i++) {
            const [pass, batch] = this._pb_buffer[i];
            pass.upload(commandBuffer);
            batch.upload(commandBuffer);
        }
    }

    render(profile: Profile, commandBuffer: CommandBuffer, renderPass: RenderPass) {
        let material: DescriptorSet | undefined;
        let pipeline: Pipeline | undefined;
        for (let i = 0; i < this._pb_count; i++) {
            const [pass, batch] = this._pb_buffer[i];
            if (pass.descriptorSet && material != pass.descriptorSet) {
                commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                material = pass.descriptorSet;

                profile.materials++;
            }

            if (batch.descriptorSet) {
                commandBuffer.bindDescriptorSet(shaderLib.sets.batch.index, batch.descriptorSet);
            }

            const pl = this._context.getPipeline(pass.state, batch.inputAssembler.vertexInputState, renderPass, [pass.descriptorSetLayout, batch.descriptorSetLayout]);
            if (pipeline != pl) {
                commandBuffer.bindPipeline(pl);
                pipeline = pl;

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