import { BufferUsageFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayout, Format, InputAssembler, VertexAttribute, VertexInput } from "gfx";
import { BufferView } from "../../../core/render/gpu/BufferView.js";
import { Model } from "../../../core/render/scene/Model.js";
import { PeriodicFlag } from "../../../core/render/scene/PeriodicFlag.js";
import { SubMesh } from "../../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../../core/shaderLib.js";

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

function createModelAttribute(buffer: number) {
    const mat4 = new VertexAttribute;
    mat4.location = shaderLib.attributes.model.location;
    mat4.format = Format.RGBA32_SFLOAT;
    mat4.buffer = buffer;
    mat4.instanced = true;
    mat4.multiple = 4;
    return mat4;
}

export class InstanceBatch {
    readonly descriptorSetLayout: DescriptorSetLayout;
    readonly descriptorSet: DescriptorSet | undefined;

    readonly inputAssembler: InputAssembler;

    readonly draw: Readonly<SubMesh.Draw>;

    private _count = 0;
    get count(): number {
        return this._count;
    }

    private readonly _view: BufferView;

    private _lockedFlag = new PeriodicFlag();
    get locked(): boolean {
        return this._lockedFlag.value != 0;
    }

    constructor(subMesh: SubMesh, descriptorSetLayout: DescriptorSetLayout, descriptorSet?: DescriptorSet) {
        const view = new BufferView('Float32', BufferUsageFlagBits.VERTEX);
        const ia = inputAssembler_clone(subMesh.inputAssembler);
        ia.vertexInputState.attributes.add(createModelAttribute(ia.vertexInput.buffers.size()));
        ia.vertexInput.buffers.add(view.buffer);
        ia.vertexInput.offsets.add(0);
        this._view = view;
        this.inputAssembler = ia;
        this.draw = subMesh.draw;
        this.descriptorSetLayout = descriptorSetLayout;
        this.descriptorSet = descriptorSet;
    }

    add(model: Model) {
        model.fillInstanced(this._view, this._count++);
    }

    upload(commandBuffer: CommandBuffer): void {
        this._view.update(commandBuffer);
        this._lockedFlag.reset(1);
    }

    recycle(): void {
        this._count = 0;
    }
}