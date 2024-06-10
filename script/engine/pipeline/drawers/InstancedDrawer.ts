import { BufferUsageFlagBits, CommandBuffer, DescriptorSetLayout, Format, InputAssembler, RenderPass, VertexAttribute, VertexInput } from "gfx";
import { BufferView } from "../../core/render/BufferView.js";
import { UniformResource } from "../../core/render/UniformResource.js";
import { Context } from "../../core/render/pipeline/Context.js";
import { Drawer } from "../../core/render/pipeline/Drawer.js";
import { Model } from "../../core/render/scene/Model.js";
import { PeriodicFlag } from "../../core/render/scene/PeriodicFlag.js";
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

const descriptorSetLayoutEmpty = shaderLib.createDescriptorSetLayout([]);

class Batch {
    private readonly _buffer: BufferView = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16)

    readonly inputAssemblers: InputAssembler[];

    private _hasUpdated = new PeriodicFlag();

    constructor(public model: Model) {
        const inputAssemblers: InputAssembler[] = [];
        for (const subMesh of model.mesh.subMeshes) {
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

            inputAssemblers.push(inputAssembler);
        }
        this.inputAssemblers = inputAssemblers;
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
    const batches: WeakMap<Model, Batch> = new WeakMap;
    return function (model: Model) {
        let batch = batches.get(model);
        if (!batch) {
            batch = new Batch(model);
            batches.set(model, batch);
        }
        return batch;
    }
})()

export class InstancedDrawer implements Drawer {
    record(context: Context, commandBuffer: CommandBuffer, renderPass: RenderPass, passType: string, models: Model[]): number {
        let draws = 0
        for (const model of models) {
            if (model.getDescriptorSetLayout()) {
                commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, UniformResource.cache(model).update().descriptorSet!);
            }
            const batch = model2batch(model);
            batch.update();
            for (let i = 0; i < model.mesh.subMeshes.length; i++) {
                const subMesh = model.mesh.subMeshes[i];
                const draw = subMesh.draw;
                if (!draw.count) {
                    continue;
                }
                const inputAssembler = batch.inputAssemblers[i];
                const material = model.materials[i];
                for (const pass of material.passes) {
                    if (pass.type != passType) {
                        continue;
                    }

                    const resource = UniformResource.cache(pass);
                    resource.update();

                    const layouts: DescriptorSetLayout[] = [model.getDescriptorSetLayout() || descriptorSetLayoutEmpty];
                    if (resource.descriptorSetLayout) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, resource.descriptorSet!);
                        layouts.push(resource.descriptorSetLayout);
                    }
                    const pipeline = context.getPipeline(pass.state, inputAssembler, renderPass, layouts);
                    commandBuffer.bindPipeline(pipeline);
                    commandBuffer.bindInputAssembler(inputAssembler);
                    if (inputAssembler.indexInput) {
                        commandBuffer.drawIndexed(draw.count, draw.first, 1);
                    } else {
                        commandBuffer.draw(draw.count, 1);
                    }
                    draws++;
                }
            }
        }
        return draws;
    }
}