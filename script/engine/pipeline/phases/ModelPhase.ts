import { BufferUsageFlagBits, CommandBuffer, DescriptorSetLayout, Format, InputAssembler, RenderPass, VertexAttribute, VertexInput } from "gfx";
import { Zero } from "../../core/Zero.js";
import { BufferView } from "../../core/render/BufferView.js";
import { Context } from "../../core/render/pipeline/Context.js";
import { Culler } from "../../core/render/pipeline/Culling.js";
import { Phase } from "../../core/render/pipeline/Phase.js";
import { Profile } from "../../core/render/pipeline/Profile.js";
import { Model } from "../../core/render/scene/Model.js";
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

        const strides = vertexInput.strides;
        const strides_size = strides.size();
        for (let i = 0; i < strides_size; i++) {
            out.strides.add(strides.get(i));
        }

        return out;
    }

    return function (inputAssembler: InputAssembler): InputAssembler {
        const out = new InputAssembler;

        const vertexAttributes = inputAssembler.vertexAttributes
        const size = vertexAttributes.size();
        for (let i = 0; i < size; i++) {
            out.vertexAttributes.add(vertexAttributes.get(i));
        }

        vertexInput_clone(out.vertexInput, inputAssembler.vertexInput);

        if (inputAssembler.indexInput) {
            out.indexInput = inputAssembler.indexInput;
        }

        return out;
    }
})()

class Batch {
    private readonly _buffer: BufferView = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16)

    readonly inputAssembler: InputAssembler;

    get draw(): SubMesh.Draw {
        return this.model.mesh.subMeshes[this._subIndex].draw;
    }

    private _hasUpdated = new PeriodicFlag();

    constructor(public model: Model, private _subIndex: number) {
        const subMesh = model.mesh.subMeshes[_subIndex];
        const inputAssembler = inputAssembler_clone(subMesh.inputAssembler);
        for (let i = 0; i < 4; i++) {
            const model = new VertexAttribute;
            model.name = shaderLib.attributes.model.name;
            model.format = Format.RGBA32_SFLOAT;
            model.location = shaderLib.attributes.model.location + i;
            model.buffer = inputAssembler.vertexInput.buffers.size();
            model.offset = 16 * i;
            model.instanced = true;
            inputAssembler.vertexAttributes.add(model);
        }
        inputAssembler.vertexInput.buffers.add(this._buffer.buffer);
        inputAssembler.vertexInput.offsets.add(0);
        this.inputAssembler = inputAssembler;
    }

    update() {
        if (this._hasUpdated.value) {
            return;
        }

        if (this.model.transform.hasChanged) {
            this._buffer.set(this.model.transform.world_matrix);
            this._buffer.update();
        }

        this._hasUpdated.clear(1);
    }
}

const model2batch = (function () {
    const model2batches: WeakMap<Model, Batch[]> = new WeakMap;
    return function (model: Model, subIndex: number) {
        let batches = model2batches.get(model);
        if (!batches) {
            batches = [];
            model2batches.set(model, batches);
        }
        let batch = batches[subIndex];
        if (!batch) {
            batch = batches[subIndex] = new Batch(model, subIndex);
        }
        return batch;
    }
})()

function modelCompareFn(a: Model, b: Model) {
    return a.order - b.order;
}

export class ModelPhase extends Phase {
    constructor(
        context: Context,
        visibility: number,
        public culler: Culler,
        private _batching: boolean = false,
        /**The model type that indicates which models should run in this phase */
        private _model = 'default',
        /**The pass type that indicates which passes should run in this phase */
        private _pass = 'default',
    ) {
        super(context, visibility);
    }

    record(profile: Profile, commandBuffer: CommandBuffer, renderPass: RenderPass, cameraIndex: number) {
        profile.emit(Profile.Event.CULL_START);
        const models = this.culler.cull(Zero.instance.scene.models, this._model, cameraIndex);
        profile.emit(Profile.Event.CULL_END);
        models.sort(modelCompareFn);

        for (const model of models) {
            model.upload();

            if (model.descriptorSet) {
                commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, model.descriptorSet!);
            }
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                if (!model.mesh.subMeshes[i].draw.count) {
                    continue;
                }

                const batch = model2batch(model, i);
                batch.update();

                const material = model.materials[i];
                for (const pass of material.passes) {
                    if (pass.type != this._pass) {
                        continue;
                    }

                    pass.upload();

                    const layouts: DescriptorSetLayout[] = [(model.constructor as typeof Model).descriptorSetLayout];
                    if (pass.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                        layouts.push(pass.descriptorSetLayout);
                    }
                    const pipeline = this._context.getPipeline(pass.state, batch.inputAssembler, renderPass, layouts);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindInputAssembler(batch.inputAssembler);
                    if (batch.inputAssembler.indexInput) {
                        commandBuffer.drawIndexed(batch.draw.count, batch.draw.first, 1);
                    } else {
                        commandBuffer.draw(batch.draw.count, 1);
                    }
                    profile.draws++;
                }
            }
        }
    }
}