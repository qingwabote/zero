import { device } from "boot";
import { BufferUsageFlagBits, DescriptorSet, DescriptorSetLayout, DescriptorSetLayoutInfo, Format, InputAssembler, VertexAttribute, VertexInput } from "gfx";
import { Zero } from "../../../core/Zero.js";
import { Mat4 } from "../../../core/math/mat4.js";
import { BufferView } from "../../../core/render/BufferView.js";
import { Model } from "../../../core/render/scene/Model.js";
import { PeriodicFlag } from "../../../core/render/scene/PeriodicFlag.js";
import { SubMesh } from "../../../core/render/scene/SubMesh.js";
import { shaderLib } from "../../../core/shaderLib.js";

interface Local {
    readonly descriptorSetLayout: DescriptorSetLayout,
    readonly descriptorSet?: DescriptorSet,
}

const local_empty: Local = { descriptorSetLayout: device.createDescriptorSetLayout(new DescriptorSetLayoutInfo) }

export interface InstanceBatch {
    readonly local: Local;
    readonly inputAssembler: InputAssembler;
    readonly draw: Readonly<SubMesh.Draw>;
    readonly count: number;

    upload(): void;
    recycle(): void;
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
    export class Single implements InstanceBatch {
        readonly local: Local;

        readonly inputAssembler: InputAssembler;

        readonly draw: Readonly<SubMesh.Draw>;

        readonly count: number = 1;

        private readonly _view = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16)

        private _lastUploadFrame = -1;

        constructor(readonly model: Model, subIndex: number) {
            const view = new BufferView('Float32', BufferUsageFlagBits.VERTEX, 16)
            const subMesh = model.mesh.subMeshes[subIndex];
            const ia = inputAssembler_clone(subMesh.inputAssembler);
            ia.vertexInputState.attributes.add(createModelAttribute(ia.vertexInput.buffers.size()));
            ia.vertexInput.buffers.add(view.buffer);
            ia.vertexInput.offsets.add(0);
            this._view = view;
            this.local = model;
            this.inputAssembler = ia;
            this.draw = subMesh.draw;
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

        recycle(): void { }
    }

    export class Multiple implements InstanceBatch {
        readonly local: Local = local_empty;

        readonly inputAssembler: InputAssembler;

        readonly draw: Readonly<SubMesh.Draw>;

        private _count = 0;
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
            this._view = view;
            this.inputAssembler = ia;
            this.draw = subMesh.draw;
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