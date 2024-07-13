import { device } from "boot";
import { BufferUsageFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayout, DescriptorSetLayoutInfo, Format, InputAssembler, PrimitiveTopology, RenderPass, VertexAttribute, VertexInput } from "gfx";
import { Zero } from "../../../core/Zero.js";
import { Mat4 } from "../../../core/math/mat4.js";
import { BufferView } from "../../../core/render/BufferView.js";
import { Context } from "../../../core/render/pipeline/Context.js";
import { Profile } from "../../../core/render/pipeline/Profile.js";
import { Model } from "../../../core/render/scene/Model.js";
import { Pass } from "../../../core/render/scene/Pass.js";
import { PeriodicFlag } from "../../../core/render/scene/PeriodicFlag.js";
import { SubMesh } from "../../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../../core/shaderLib.js";

interface Local {
    readonly descriptorSetLayout: DescriptorSetLayout,
    readonly descriptorSet?: DescriptorSet,
}

const local_empty: Local = { descriptorSetLayout: device.createDescriptorSetLayout(new DescriptorSetLayoutInfo) }

export abstract class InstanceBatch {
    static subDraws = 1;

    constructor(
        protected readonly _inputAssembler: InputAssembler,
        protected readonly _draw: Readonly<SubMesh.Draw>,
        protected _count: number,
        protected readonly _local = local_empty) { }

    record(profile: Profile, commandBuffer: CommandBuffer, renderPass: RenderPass, context: Context, passState: Pass.State) {
        this.upload();

        if (this._local.descriptorSet) {
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, this._local.descriptorSet);
        }

        const pipeline = context.getPipeline(passState, this._inputAssembler.vertexInputState, renderPass, [this._local.descriptorSetLayout]);
        commandBuffer.bindPipeline(pipeline);
        commandBuffer.bindInputAssembler(this._inputAssembler);

        let alignment;
        switch (this._inputAssembler.vertexInputState.primitive) {
            case PrimitiveTopology.LINE_LIST:
                alignment = 2;
                break;
            case PrimitiveTopology.TRIANGLE_LIST:
                alignment = 3;
                break;
            default:
                throw `unsupported primitive: ${this._inputAssembler.vertexInputState.primitive}`
        }

        const subCount = Math.ceil(this._draw.count / InstanceBatch.subDraws / alignment) * alignment;

        let count = 0;
        while (count < this._draw.count) {
            if (this._inputAssembler.indexInput) {
                commandBuffer.drawIndexed(count + subCount > this._draw.count ? this._draw.count - count : subCount, this._draw.first + count, this._count);
            } else {
                commandBuffer.draw(count + subCount > this._draw.count ? this._draw.count - count : subCount, this._draw.first + count, this._count);
            }
            count += subCount;
            profile.draws++;
        }

        this.recycle();
    }

    protected abstract upload(): void;

    protected recycle(): void { }
}

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

export namespace InstanceBatch {
    export class Single extends InstanceBatch {
        private readonly _view = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16)

        private _lastUploadFrame = -1;

        constructor(public model: Model, subIndex: number) {
            const view = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16)
            const subMesh = model.mesh.subMeshes[subIndex];
            const inputAssembler = inputAssembler_clone(subMesh.inputAssembler);
            const bufferIndex = inputAssembler.vertexInput.buffers.size();
            inputAssembler.vertexInputState.attributes.add(createModelAttribute(bufferIndex));
            inputAssembler.vertexInput.buffers.add(view.buffer);
            inputAssembler.vertexInput.offsets.add(0);
            super(inputAssembler, subMesh.draw, 1, model);
            this._view = view;
        }

        upload() {
            const frame = Zero.frameCount;
            if (frame == this._lastUploadFrame) {
                return;
            }

            if (this.model.transform.hasChangedFlag.value || frame - this._lastUploadFrame > 1) {
                this._view.set(this.model.transform.world_matrix);
                this._view.update();
            }

            this._lastUploadFrame = frame;
        }
    }

    export class Multiple extends InstanceBatch {
        get count(): number {
            return this._count;
        }

        private readonly _view: BufferView = new BufferView('Float32', BufferUsageFlagBits.VERTEX);

        private _lockedFlag = new PeriodicFlag();
        get locked(): boolean {
            return this._lockedFlag.value != 0;
        }

        constructor(subMesh: SubMesh) {
            const view = new BufferView('Float32', BufferUsageFlagBits.VERTEX);
            const ia = inputAssembler_clone(subMesh.inputAssembler);
            const bufferIndex = ia.vertexInput.buffers.size();
            ia.vertexInputState.attributes.add(createModelAttribute(bufferIndex));
            ia.vertexInput.buffers.add(view.buffer);
            ia.vertexInput.offsets.add(0);
            super(ia, subMesh.draw, 0);
            this._view = view;
        }

        add(transform: Readonly<Mat4>) {
            this._view.resize(16 * (this._count + 1));
            this._view.set(transform, 16 * this._count);
            this._count++;
        }

        upload(): void {
            this._view.update();
            this._lockedFlag.reset(1);
        }

        recycle(): void {
            this._count = 0;
        }
    }
}