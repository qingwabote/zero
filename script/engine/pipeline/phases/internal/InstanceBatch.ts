import { BufferUsageFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayout, Format, InputAssembler, RenderPass, VertexAttribute, VertexInput } from "gfx";
import { Zero } from "../../../core/Zero.js";
import { Mat4 } from "../../../core/math/mat4.js";
import { BufferView } from "../../../core/render/BufferView.js";
import { Context } from "../../../core/render/pipeline/Context.js";
import { Model } from "../../../core/render/scene/Model.js";
import { Pass } from "../../../core/render/scene/Pass.js";
import { PeriodicFlag } from "../../../core/render/scene/PeriodicFlag.js";
import { SubMesh } from "../../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../../core/shaderLib.js";

interface Local {
    readonly descriptorSetLayout: DescriptorSetLayout,
    readonly descriptorSet?: DescriptorSet,
}

const local_empty: Local = { descriptorSetLayout: shaderLib.descriptorSetLayout_empty }

export abstract class InstanceBatch {
    constructor(
        protected readonly _inputAssembler: InputAssembler,
        protected readonly _draw: Readonly<SubMesh.Draw>,
        protected _count: number,
        protected readonly _local = local_empty) { }

    record(commandBuffer: CommandBuffer, renderPass: RenderPass, context: Context, pass: Pass) {
        this.upload();

        if (this._local.descriptorSet) {
            commandBuffer.bindDescriptorSet(shaderLib.sets.local.index, this._local.descriptorSet);
        }

        const pipeline = context.getPipeline(pass.state, this._inputAssembler.vertexAttributes, renderPass, [pass.descriptorSetLayout, this._local.descriptorSetLayout]);
        commandBuffer.bindPipeline(pipeline);
        commandBuffer.bindInputAssembler(this._inputAssembler);
        if (this._inputAssembler.indexInput) {
            commandBuffer.drawIndexed(this._draw.count, this._draw.first, this._count);
        } else {
            commandBuffer.draw(this._draw.count, this._count);
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

function createModelAttribute(column: number, buffer: number) {
    const vec4 = new VertexAttribute;
    vec4.name = shaderLib.attributes.model.name;
    vec4.instanced = true;
    vec4.format = Format.RGBA32_SFLOAT;
    vec4.location = shaderLib.attributes.model.location + column;
    vec4.offset = 16 * column;
    vec4.buffer = buffer;
    return vec4;
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
            for (let i = 0; i < 4; i++) {
                inputAssembler.vertexAttributes.add(createModelAttribute(i, bufferIndex));
            }
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
            for (let i = 0; i < 4; i++) {
                ia.vertexAttributes.add(createModelAttribute(i, bufferIndex));
            }
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